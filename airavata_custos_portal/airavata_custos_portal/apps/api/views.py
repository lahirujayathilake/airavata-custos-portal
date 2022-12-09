from django.conf import settings
from django.http import HttpResponse
from rest_framework.decorators import api_view
from rest_framework.response import Response

from django.shortcuts import redirect, render
import requests
import base64
import jwt


# Create your views here.
@api_view()
def get_config(request):
    # Just a simple REST API view to show how to access VUE_APP_* settings
    return Response({"VUE_APP_UNDER_MAINTENANCE": settings.VUE_APP_UNDER_MAINTENANCE})


VUE_APP_CUSTOS_API_URL = "https://prod.custos.usecustos.org/apiserver"
ENDPOINTS = {
    "IDENTITY": "/identity-management/v1.0.0",
    "USERS": "user-management/v1.0.0",
    "GROUPS": "group-management/v1.0.0",
    "TENANTS": "tenant-management/v1.0.0",
    "SHARING": "sharing-management/v1.0.0",
    "SECRETS": "resource-secret-management/v1.0.0"
};


@api_view()
def get_userinfo(request):
    # return Response({
    #     "access_token": request.session['access_token']
    # })

    payload = jwt.decode(jwt=request.session['access_token'], verify=False)

    return Response(payload)



@api_view()
def get_auth(request):
    response = requests.get(url=f"{VUE_APP_CUSTOS_API_URL}{ENDPOINTS['IDENTITY']}/.well-known/openid-configuration",
                            params={'client_id': VUE_APP_CLIENT_ID})
    response = response.json()
    print("####### response ", response)
    authorization_endpoint = response["authorization_endpoint"]
    url = f"{authorization_endpoint}?response_type=code&client_id={VUE_APP_CLIENT_ID}&redirect_uri={VUE_APP_REDIRECT_URI}&scope=openid"

    ciLogonInstitutionEntityId = False

    if ciLogonInstitutionEntityId:
        url = f"{url}&kc_idp_hint=oidc&idphint={ciLogonInstitutionEntityId}"
    else:
        url = f"{url}&kc_idp_hint=oidc"

    return redirect(url)


@api_view()
def get_auth_callback(request):
    code = request.GET.get("code", None)

    client_auth_base64 = f"{VUE_APP_CLIENT_ID}:{VUE_APP_CLIENT_SEC}"
    client_auth_base64 = client_auth_base64.encode("utf-8")
    client_auth_base64 = base64.b64encode(client_auth_base64).decode('utf-8')
    client_auth_base64 = f"Bearer {client_auth_base64}"

    response = requests.post(url=f"{VUE_APP_CUSTOS_API_URL}{ENDPOINTS['IDENTITY']}/token",
                             json={'code': code, 'redirect_uri': VUE_APP_REDIRECT_URI,
                                   'grant_type': 'authorization_code'},
                             headers={
                                 'Accept': '*/*',
                                 'Content-Type': 'application/json',
                                 'Authorization': client_auth_base64

                             })
    response = response.json()

    # if request.session.test_cookie_worked():
    #     request.session.delete_test_cookie()
    #     return HttpResponse("You're logged in.")
    # else:
    #     return HttpResponse("Please enable cookies and try again.")

    # request.session.set_test_cookie()

    request.session.set_expiry(response["expires_in"])
    request.session['access_token'] = response["access_token"]
    request.session['refresh_token'] = response["refresh_token"]
    request.session['id_token'] = response["id_token"]

    return redirect("/")
    # return render(request, "airavata_custos_portal_frontend/index.html")

    # return Response({
    #     "access_token": response["access_token"],
    #     "refresh_token": response["refresh_token"],
    #     "id_token": response["id_token"]
    # })


@api_view()
def get_custos_api(request, endpoint_path=""):
    if request.method == 'GET':
        response = requests.get(url=f"{VUE_APP_CUSTOS_API_URL}/{endpoint_path}?{request.GET.urlencode()}",
                                headers={
                                    'Accept': '*/*',
                                    'Content-Type': 'application/json',
                                    'Authorization': f"Bearer {request.session['access_token']}"
                                })
    elif request.method == 'POST':
        response = requests.post(url=f"{VUE_APP_CUSTOS_API_URL}/{endpoint_path}?{request.GET.urlencode()}",
                                 json=request.POST,
                                 headers={
                                     'Accept': '*/*',
                                     'Content-Type': 'application/json',
                                     'Authorization': f"Bearer {request.session['access_token']}"
                                 })

    return Response(response.json())

    # return Response({
    #     "endpoint_path": endpoint_path,
    #     "body": request.body,
    #     "headers": request.headers
    # })
