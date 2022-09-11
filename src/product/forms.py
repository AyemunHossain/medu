from django.forms import forms, ModelForm, CharField, TextInput, Textarea, BooleanField, CheckboxInput

from product.models import Variant, Product, ProductImage, ProductVariant, ProductVariantPrice


class VariantForm(ModelForm):
    class Meta:
        model = Variant
        fields = '__all__'
        widgets = {
            'title': TextInput(attrs={'class': 'form-control'}),
            'description': Textarea(attrs={'class': 'form-control'}),
            'active': CheckboxInput(attrs={'class': 'form-check-input', 'id': 'active'})
        }

class ProductForm(ModelForm):
    class Meta:
        model = Product
        fields = '__all__'

class ProductImageForm(ModelForm):
    class Meta:
        model = ProductImage
        fields = '__all__'



class ProductVariantForm(ModelForm):
    class Meta:
        model = ProductVariant
        fields = '__all__'


class ProductVariantPriceForm(ModelForm):
    class Meta:
        model = ProductVariantPrice
        fields = '__all__'
