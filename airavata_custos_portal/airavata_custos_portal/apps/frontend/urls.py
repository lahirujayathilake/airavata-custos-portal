from django.urls import path

from . import views


app_name = "airavata_custos_portal_frontend"
urlpatterns = [
    path('', views.home, name="home")
]
