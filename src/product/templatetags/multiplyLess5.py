from django import template

register = template.Library()

@register.filter
def multiplyLess5(value, arg=1):
    if value<5:
        return value
    return  ((5 * arg)-5) if ((5 * arg)-5) > 1 else 1