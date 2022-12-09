from django.shortcuts import render

# Create your views here.

def home(request):
    return render(request, "airavata_custos_portal_frontend/index.html")

