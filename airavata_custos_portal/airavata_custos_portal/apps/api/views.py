from django.conf import settings
from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response


# Create your views here.
@api_view()
def get_config(request):
    # Just a simple REST API view to show how to access VUE_APP_* settings
    return Response({"VUE_APP_UNDER_MAINTENANCE": settings.VUE_APP_UNDER_MAINTENANCE})
