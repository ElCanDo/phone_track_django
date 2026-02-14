from django.views.generic import TemplateView


class TrackerFrontendView(TemplateView):
    template_name = "tracker/index.html"
