import unittest
import json
from app import create_app, db
from models import User, Job, JobStage
from config import Config


class TestConfig(Config):
    TESTING = True
    SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'
    WTF_CSRF_ENABLED = False


class BackendTestSuite(unittest.TestCase):
    def setUp(self):
        self.app = create_app(TestConfig)
        self.client = self.app.test_client()
        self.ctx = self.app.app_context()
        self.ctx.push()

    def tearDown(self):
        db.session.remove()
        db.drop_all()
        self.ctx.pop()

    def get_admin_token(self):
        res = self.client.post('/api/auth/login', json={
            'email': 'arun@aszen.com',
            'password': 'Aszen@123'
        })
        return res.get_json()['token']

    def test_health_check(self):
        res = self.client.get('/api/health')
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.get_json(), {'status': 'ok'})

    def test_login_success(self):
        res = self.client.post('/api/auth/login', json={
            'email': 'arun@aszen.com',
            'password': 'Aszen@123'
        })
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertIn('token', data)
        self.assertEqual(data['user']['email'], 'arun@aszen.com')

    def test_login_invalid_password(self):
        res = self.client.post('/api/auth/login', json={
            'email': 'arun@aszen.com',
            'password': 'WrongPassword'
        })
        self.assertEqual(res.status_code, 401)

    def test_legacy_test_accounts_absent(self):
        shwetha = User.query.filter_by(email='shwetha@aszen.com').first()
        qa_tester = User.query.filter_by(email='qa_perm_test@aszen.com').first()
        self.assertIsNone(shwetha)
        self.assertIsNone(qa_tester)

    def test_job_creation_and_granular_stage_patch(self):
        token = self.get_admin_token()
        headers = {'Authorization': f'Bearer {token}'}

        # 1. Create Job
        create_res = self.client.post('/api/jobs', headers=headers, json={
            'jobNumber': '2001',
            'client': 'BE',
            'service': 'Real Estate Photo Shoot',
            'outputTarget': 50,
            'stages': {
                'blending': {'assignee': 'John Editor', 'status': 'Pending'},
                'path1': {'assignee': 'Sarah Path', 'status': 'Pending'}
            }
        })
        self.assertEqual(create_res.status_code, 201)
        created_job = create_res.get_json()['job']
        self.assertEqual(created_job['jobNumber'], '2001')

        # 2. Granular PATCH stage without overwriting other stages
        patch_res = self.client.patch('/api/jobs/2001/stages/blending', headers=headers, json={
            'status': 'In-Progress',
            'startTime': '2026-09-28T10:00:00.000Z',
            'filesCount': 50
        })
        self.assertEqual(patch_res.status_code, 200)
        patched_stage = patch_res.get_json()['stage']
        self.assertEqual(patched_stage['status'], 'In-Progress')
        self.assertEqual(patched_stage['startTime'], '2026-09-28T10:00:00.000Z')

        # Verify other stage was NOT mutated
        path1_stage = JobStage.query.filter_by(job_id=created_job['db_id'], stage_key='path1').first()
        self.assertEqual(path1_stage.status, 'Pending')
        self.assertEqual(path1_stage.assignee, 'Sarah Path')


if __name__ == '__main__':
    unittest.main()
