"""Regresiones de la versión 1.0.4; no requiere API externa ni datos de alumnado."""
import json
import sys
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch
from docx import Document

sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
import logic

class CurriculumSpeedTests(unittest.TestCase):
    def test_rejects_ce_not_in_document(self):
        text=('Programación de Técnica Contable. Código del módulo: 0299. '
              'RA1: Identifica los principios básicos de contabilidad. '
              'Los criterios a) a f) se trabajarán. RA204 es una referencia.')
        reply={'outcomes':[{'code':'RA1','description':'Identifica los principios básicos de contabilidad.',
                'weight':20,'criteria':[{'code':'RA1.a',
                'description':'Se ha identificado una norma inexistente en el documento.','weight':20}]}]}
        with patch.object(logic.ia,'chat',return_value=(reply,'simulado')):
            result=logic.analyze_program(text)
        self.assertEqual(result['coverage']['ce_accepted'],0)
        self.assertTrue(any('0441' in w for w in result['warnings']))
        self.assertTrue(any('RA204' in w for w in result['warnings']))

    def test_accepts_verbatim_ce_with_code(self):
        text='RA2: Registra operaciones contables. a) Se han registrado las operaciones en los libros contables.'
        reply={'outcomes':[{'code':'RA2','description':'Registra operaciones contables.',
                'weight':None,'criteria':[{'code':'RA2.a',
                'description':'Se han registrado las operaciones en los libros contables.','weight':None}]}]}
        with patch.object(logic.ia,'chat',return_value=(reply,'simulado')):
            result=logic.analyze_program(text)
        self.assertEqual(result['coverage']['ce_accepted'],1)

    def test_official_numbered_ra_and_table(self):
        text=('Resultados de aprendizaje y criterios de evaluación\n'
              '1. Reconoce los elementos de un patrimonio económico clasificándolos correctamente.\n'
              'Criterios de evaluación:\n'
              'a) | Se han identificado las partes fundamentales del patrimonio empresarial.\n'
              'Duración: 55 horas.')
        reply={'outcomes':[{'code':'RA1',
                'description':'Reconoce los elementos de un patrimonio económico clasificándolos correctamente.',
                'weight':None,'criteria':[{'code':'RA1.a',
                'description':'Se han identificado las partes fundamentales del patrimonio empresarial.','weight':None}]}]}
        with patch.object(logic.ia,'chat',return_value=(reply,'simulado')):
            result=logic.analyze_program(text)
        self.assertEqual(result['coverage']['ce_accepted'],1)

    def test_batch_requests_fewer_than_per_ce(self):
        criteria=[{'id':i+1,'code':f'RA2.{chr(97+i)}','description':f'Operación {i}',
                   'outcome_weight':100,'criterion_weight':10} for i in range(10)]
        slots=logic.allocate_slots(criteria,10,'test',10)
        requests=[]
        def fake(role,prompt,images=None):
            batch=json.loads(prompt.split('PLAN DE PREGUNTAS: ',1)[1].split('\n',1)[0])
            requests.append(len(batch))
            questions=[{'number':q['number'],'options':['A) Sí','B) No','C) Tal vez','D) Nunca'],
                        'correct_option':'A','ideal_answer':'Sí','rubric':[],
                        'prompt':f'Pregunta sobre {q["criterion_code"]} bloque {len(requests)} '+
                        str(len(requests)*100+q['number'])*40} for q in batch]
            return {'questions':questions},'simulado'
        with patch.object(logic.ia,'chat',side_effect=fake):
            models,bank,_=logic.build_exam_models('Prueba','test',10,slots,3)
        self.assertLessEqual(len(requests),5)
        self.assertEqual(len(bank),30)
        self.assertEqual([len(x) for x in models],[10,10,10])
        self.assertEqual(len({logic.question_fingerprint(q['prompt']) for x in models for q in x}),30)

    def test_repeated_material_passage_is_sent_once(self):
        slot={'number':1,'criterion_id':1,'criterion_code':'RA1.a',
              'criterion_description':'Identificar cuentas','kind':'test','points':5}
        slots=[slot,{**slot,'number':2}]
        passage={'id':3,'filename':'tema.txt','location_kind':'bloque','location_number':1,'material_id':1,
                 'body':'Una cuenta contable registra movimientos económicos de una empresa.'}
        def fake(role,prompt,images=None):
            self.assertEqual(prompt.count('PASO ID 3 |'),1)
            return {'questions':[{'number':i,'prompt':'¿Qué registra una cuenta contable?',
                     'options':['A) Movimientos','B) Vacaciones','C) Horas','D) Nombres'],
                     'correct_option':'A','ideal_answer':'Movimientos','rubric':[],
                     'source':{'passage_id':3,'evidence':'Una cuenta contable registra movimientos'}} for i in (1,2)]},'simulado'
        with patch.object(logic.ia,'chat',side_effect=fake):
            qs,_=logic.generate_exam('Prueba','test',10,slots,sources={1:[passage],2:[passage]})
        self.assertEqual(len(qs),2)

    def test_docx_tables_remain_between_paragraphs(self):
        with tempfile.TemporaryDirectory() as tmp:
            path=Path(tmp)/'ejemplo.docx'
            doc=Document()
            doc.add_paragraph('RA2: Registra hechos contables.')
            table=doc.add_table(rows=1,cols=2)
            table.cell(0,0).text='a)'
            table.cell(0,1).text='Se han reconocido los libros contables.'
            doc.add_paragraph('Fin de los criterios.')
            doc.save(path)
            text=logic.extract_program(path)
            self.assertLess(text.index('RA2:'),text.index('a)'))
            self.assertLess(text.index('a)'),text.index('Fin de los criterios.'))
