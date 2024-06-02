from django.urls import path, re_path

from . import views

urlpatterns = [
    path("config", views.get_config),
    path("userinfo", views.get_userinfo),
    path('callback', views.get_auth_callback),
    re_path(r'^(?P<endpoint_path>.*)$', views.get_custos_api)
]
