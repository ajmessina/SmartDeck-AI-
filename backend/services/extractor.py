import pandas as pd
from docx import Document
import os

class DataExtractor:
    def extract(self, file_path: str) -> str:
        ext = os.path.splitext(file_path)[1].lower()
        if ext in ['.xlsx', '.xls']:
            return self._extract_excel(file_path)
        elif ext == '.csv':
            return self._extract_csv(file_path)
        elif ext in ['.docx', '.doc']:
            return self._extract_word(file_path)
        elif ext in ['.png', '.jpg', '.jpeg']:
            return f"[IMAGE_FILE: {os.path.basename(file_path)} - Content will be analyzed by Vision AI]"
        else:
            return f"Unsupported file type: {ext}"

    def _extract_excel(self, file_path: str) -> str:
        try:
            # Read all sheets
            xls = pd.ExcelFile(file_path)
            text_output = []
            for sheet_name in xls.sheet_names:
                df = pd.read_excel(xls, sheet_name=sheet_name)
                text_output.append(f"--- Sheet: {sheet_name} ---")
                text_output.append(df.to_markdown(index=False))
            return "\n\n".join(text_output)
        except Exception as e:
            return f"Error reading Excel: {str(e)}"

    def _extract_csv(self, file_path: str) -> str:
        try:
            df = pd.read_csv(file_path)
            return f"--- CSV Data ---\n{df.to_markdown(index=False)}"
        except Exception as e:
             return f"Error reading CSV: {str(e)}"

    def _extract_word(self, file_path: str) -> str:
        try:
            doc = Document(file_path)
            full_text = []
            for para in doc.paragraphs:
                full_text.append(para.text)
            return "\n".join(full_text)
        except Exception as e:
            return f"Error reading Word document: {str(e)}"
