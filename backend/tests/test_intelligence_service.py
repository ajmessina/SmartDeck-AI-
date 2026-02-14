import sys
import os
import unittest
from unittest.mock import patch, MagicMock

# Add parent directory to path to find 'services' package
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from services.intelligence import IntelligenceService

class TestIntelligenceService(unittest.TestCase):
    
    @patch('services.intelligence.genai')
    def test_init_with_key(self, mock_genai):
        """Test initialization with API key configures genai"""
        service = IntelligenceService(api_key="fake-key")
        mock_genai.configure.assert_called_once_with(api_key="fake-key")
        self.assertEqual(service.model_name, 'gemini-2.5-flash')
        self.assertIsNotNone(service.model)

    def test_init_without_key(self):
        """Test initialization without API key (e.g. CI/CD)"""
        service = IntelligenceService(api_key=None)
        self.assertIsNone(service.model)
        self.assertIsNone(service.model_name)

    def test_analyze_without_key_returns_mock(self):
        """Ensure analyze_and_structure returns mock response when no key is present"""
        service = IntelligenceService(api_key=None)
        result = service.analyze_and_structure("some text")
        
        self.assertIn("presentation_title", result)
        self.assertIn("slides", result)
        self.assertEqual(result["presentation_title"], "Presentación Generada (Modo Demo)")

    @patch('services.intelligence.genai')
    def test_analyze_with_key_calls_model(self, mock_genai):
        """Ensure analyze_and_structure calls model.generate_content when key is present"""
        # Setup mock model
        mock_model = MagicMock()
        mock_response = MagicMock()
        mock_response.text = '{"presentation_title": "AI Title", "slides": []}'
        mock_model.generate_content.return_value = mock_response
        
        mock_genai.GenerativeModel.return_value = mock_model
        
        service = IntelligenceService(api_key="fake-key")
        result = service.analyze_and_structure("some text")
        
        mock_model.generate_content.assert_called()
        self.assertEqual(result["presentation_title"], "AI Title")

if __name__ == '__main__':
    unittest.main()
