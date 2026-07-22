from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status


def custom_exception_handler(exc, context):
    response = exception_handler(exc, context)
    if response is not None:
        payload = {
            "success": False,
            "error": {
                "code": response.status_code,
                "message": _extract_message(response.data),
                "details": response.data,
            },
        }
        response.data = payload
    return response


def _extract_message(data):
    if isinstance(data, dict):
        return data.get("detail") or data.get("message") or "Erreur serveur"
    if isinstance(data, list) and data:
        return str(data[0])
    return "Erreur serveur"


class BusinessError(Exception):
    def __init__(self, message: str, code: str = "business_error", status_code: int = 400):
        self.message = message
        self.code = code
        self.status_code = status_code
        super().__init__(message)