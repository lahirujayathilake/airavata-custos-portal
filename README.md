# Airavata Custos Portal

## How to use

Airavat custos portal is available as a python package to install and customise for tenants needs.
The forllowing instructions are for setting up a customised portal using all the features available
in the airavata custos portal.

1. Install
```
pip install airavata-custos-portal
```

2. Create a Django app
```
django-admin startproject my_first_custos_app
cd my_first_custos_app/my_first_custos_app
django-admin startapp my_custom_ui
```

3. Include the custos portal api and frontend in the urls.

```
# my_first_custos_app/my_first_custos_app/urls.py 

from django.contrib import admin
from django.urls import path
from django.conf.urls import include

urlpatterns = [
    path('admin/', admin.site.urls),
    path("api/", include("airavata_custos_portal.apps.api.urls")),
    path("", include("airavata_custos_portal.apps.frontend.urls")),
]
```

4. Also, include the custom UI app in the urls.

```
# my_first_custos_app/my_first_custos_app/urls.py 

from django.contrib import admin
from django.urls import path
from django.conf.urls import include

urlpatterns = [
    path('admin/', admin.site.urls),
    path("api/", include("airavata_custos_portal.apps.api.urls")),
    path("", include("airavata_custos_portal.apps.frontend.urls")),
    path("custom-ui/", include("my_first_custos_app.my_custom_ui.urls")),
]
```

## Development

The application consists of a Vue.js frontend and a Django based backend. 
The instructions below are for setting up the local setup for development.

### Change the configurations

Change the environment variables on `.env`

### Run Vue.js app

```
yarn install
yarn serve
```

### Lints and fixes files

```
yarn lint
```

## Running the Django server locally

```
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cd airavata_custos_portal/
./manage.py migrate
./manage.py runserver
```

And then point to http://localhost:8000

## How to publish

1. Build the static files
```
yarn build
```

2. Build the python package

```
python -m pip install --upgrade build
python -m build
```

3. Publish the python package to pypi.org. Optionally can push to test.pypi.org. See https://packaging.python.org/tutorials/packaging-projects/ for more info.

```
python -m pip install --upgrade twine
python -m twine upload dist/*
```
