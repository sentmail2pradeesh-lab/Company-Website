import unittest
import json
import urllib.request
import urllib.error
from datetime import datetime, timedelta

BASE_URL = 'http://127.0.0.1:5000/api'

class TestSystemProductionReadiness(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        # Authenticate all 3 roles
        cls.admin_token, cls.admin_user = cls.login_user('arun@aszen.com', 'Aszen@123')
        cls.manager_token, cls.manager_user = cls.login_user('lessy@aszen.com', 'Aszen@123')
        cls.employee_token, cls.employee_user = cls.login_user('lalithaa@aszen.com', 'Aszen@123')

    @staticmethod
    def login_user(email, password):
        req = urllib.request.Request(
            f"{BASE_URL}/auth/login",
            data=json.dumps({'email': email, 'password': password}).encode('utf-8'),
            headers={'Content-Type': 'application/json'}
        )
        res = urllib.request.urlopen(req)
        data = json.loads(res.read().decode('utf-8'))
        return data['token'], data['user']

    def make_request(self, endpoint, method='GET', data=None, token=None):
        url = f"{BASE_URL}{endpoint}"
        headers = {'Content-Type': 'application/json'}
        if token:
            headers['Authorization'] = f"Bearer {token}"
        
        body = json.dumps(data).encode('utf-8') if data else None
        req = urllib.request.Request(url, data=body, headers=headers, method=method)
        try:
            res = urllib.request.urlopen(req)
            return res.status, json.loads(res.read().decode('utf-8'))
        except urllib.error.HTTPError as e:
            return e.code, json.loads(e.read().decode('utf-8'))

    # ==================== TEST SUITE 1: AUTHENTICATION & SESSIONS ====================
    def test_01_valid_login(self):
        status, res = self.make_request('/auth/login', 'POST', {'email': 'lalithaa@aszen.com', 'password': 'Aszen@123'})
        self.assertEqual(status, 200)
        self.assertIn('token', res)
        self.assertEqual(res['user']['role'], 'employee')

    def test_02_invalid_login_password(self):
        status, res = self.make_request('/auth/login', 'POST', {'email': 'lalithaa@aszen.com', 'password': 'WrongPassword!'})
        self.assertEqual(status, 401)
        self.assertIn('Invalid email or password', res['message'])

    def test_03_non_existent_user(self):
        status, res = self.make_request('/auth/login', 'POST', {'email': 'nonexistent@aszen.com', 'password': 'Aszen@123'})
        self.assertEqual(status, 401)

    def test_04_auth_me_protected_route(self):
        status, res = self.make_request('/auth/me', 'GET', token=self.employee_token)
        self.assertEqual(status, 200)
        self.assertEqual(res['user']['email'], 'lalithaa@aszen.com')

    def test_05_unauthorized_access_without_token(self):
        status, res = self.make_request('/auth/me', 'GET')
        self.assertEqual(status, 401)

    # ==================== TEST SUITE 2: WORK HOURS & ATTENDANCE ====================
    def test_06_employee_login_initializes_active_session(self):
        status, res = self.make_request('/work-hours/session/login', 'POST', token=self.employee_token)
        self.assertEqual(status, 200)
        self.assertIn('session', res)
        self.assertEqual(res['session']['status'], 'Active')

    def test_07_employee_self_service_stats(self):
        status, res = self.make_request('/work-hours/my-stats', 'GET', token=self.employee_token)
        self.assertEqual(status, 200)
        self.assertIn('today_hours', res)
        self.assertIn('monthly_days_worked', res)
        self.assertIn('monthly_total_hours', res)
        self.assertIn('history', res)
        self.assertGreaterEqual(res['monthly_days_worked'], 1)

    def test_08_employee_forbidden_from_all_team_work_hours(self):
        status, res = self.make_request('/work-hours/all', 'GET', token=self.employee_token)
        self.assertEqual(status, 403)
        self.assertIn('Permission denied', res['message'])

    def test_09_manager_allowed_access_all_team_work_hours(self):
        status, res = self.make_request('/work-hours/all', 'GET', token=self.manager_token)
        self.assertEqual(status, 200)
        self.assertIn('sessions', res)
        self.assertGreater(len(res['sessions']), 0)

    def test_10_admin_allowed_access_all_team_work_hours(self):
        status, res = self.make_request('/work-hours/all', 'GET', token=self.admin_token)
        self.assertEqual(status, 200)
        self.assertIn('sessions', res)

    def test_11_manager_add_manual_work_session(self):
        payload = {
            'user_name': 'Tejas',
            'user_email': 'tejas@aszen.com',
            'date': '2026-09-02',
            'login_time': '2026-09-02T09:00:00',
            'logout_time': '2026-09-02T17:30:00',
            'notes': 'QA Manual Add Test'
        }
        status, res = self.make_request('/work-hours/manual', 'POST', payload, token=self.manager_token)
        self.assertEqual(status, 201)
        self.assertEqual(res['session']['total_hours'], 8.5)
        self.assertEqual(res['session']['status'], 'Completed')
        self.__class__.test_session_id = res['session']['id']

    def test_12_employee_forbidden_from_adding_manual_session(self):
        payload = {'user_name': 'Hacker', 'date': '2026-09-02'}
        status, res = self.make_request('/work-hours/manual', 'POST', payload, token=self.employee_token)
        self.assertEqual(status, 403)

    def test_13_manager_update_work_session(self):
        session_id = getattr(self.__class__, 'test_session_id', 1)
        payload = {
            'notes': 'QA Updated Note',
            'logout_time': '2026-09-02T18:00:00'
        }
        status, res = self.make_request(f'/work-hours/{session_id}', 'PUT', payload, token=self.manager_token)
        self.assertEqual(status, 200)
        self.assertEqual(res['session']['total_hours'], 9.0)

    def test_14_manager_delete_work_session(self):
        session_id = getattr(self.__class__, 'test_session_id', 1)
        status, res = self.make_request(f'/work-hours/{session_id}', 'DELETE', token=self.manager_token)
        self.assertEqual(status, 200)

    def test_15_session_logout_calculates_hours(self):
        status, res = self.make_request('/work-hours/session/logout', 'POST', token=self.employee_token)
        self.assertEqual(status, 200)

    # ==================== TEST SUITE 3: BLOGS & PUBLIC ENDPOINTS ====================
    def test_16_get_blogs_list(self):
        status, res = self.make_request('/blogs', 'GET')
        self.assertEqual(status, 200)
        self.assertIn('blogs', res)
        self.assertTrue(isinstance(res['blogs'], list))
        self.assertGreater(len(res['blogs']), 0)

    def test_17_get_blog_detail(self):
        status, res = self.make_request('/blogs/1', 'GET')
        self.assertEqual(status, 200)
        self.assertIn('blog', res)
        self.assertEqual(res['blog']['id'], 1)

    def test_18_create_blog_as_admin(self):
        payload = {
            'title': 'Automated Test Blog',
            'excerpt': 'Testing blog creation in production readiness suite.',
            'content': 'Detailed testing content...',
            'image_url': 'https://images.unsplash.com/photo-1560518883-ce09059eeffa'
        }
        status, res = self.make_request('/blogs', 'POST', payload, token=self.admin_token)
        self.assertEqual(status, 201)
        self.assertEqual(res['blog']['title'], 'Automated Test Blog')

    def test_19_health_check(self):
        status, res = self.make_request('/health', 'GET')
        self.assertEqual(status, 200)
        self.assertEqual(res['status'], 'ok')

if __name__ == '__main__':
    unittest.main()
