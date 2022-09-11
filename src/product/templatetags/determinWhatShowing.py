from ast import arg
from django import template

register = template.Library()

@register.filter
def determinWhatShowing(value, args):
    if args<5:
        return args
    else:
        return value * 5