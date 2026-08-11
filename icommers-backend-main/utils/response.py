from rest_framework.response import Response

def api_response(status=None, message="Success", data=None, error=None, http_status=200):
    return Response(
        {
            "status": status,
            "message": message,
            "data": data,
            "error": error,
        },
        status=http_status
    )