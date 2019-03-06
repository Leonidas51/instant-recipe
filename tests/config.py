import unittest
import datetime
from ogolodali import create_app


class MockupDBFlaskTest(unittest.TestCase):
    def setUp(self):
        self.app = create_app('testing')

    def tearDown(self):
        pass

    def test_something(self):
        self.assertTrue(True)

if __name__ == '__main__':
    unittest.main(warnings='ignore')
