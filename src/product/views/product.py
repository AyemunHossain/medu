from email.mime import image
from itertools import product
from django.views import generic
from django.core.files.storage import default_storage
from product.models import Product, Variant, ProductVariant
from product.forms import ProductForm, ProductImageForm, ProductVariantForm, ProductVariantPriceForm
from django.core.files.storage import FileSystemStorage
from django.http import HttpResponse
import json
from django.shortcuts import redirect, render
from django.views import generic
from product.models import Product, ProductVariantPrice
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
from django.views.generic import ListView, CreateView, UpdateView
from django.db.models import Q
import datetime

class CreateProductView(generic.TemplateView):
    template_name = 'products/create.html'

    def get_context_data(self, **kwargs):
        context = super(CreateProductView, self).get_context_data(**kwargs)
        variants = Variant.objects.filter(active=True).values('id', 'title')
        context['product'] = True
        context['variants'] = list(variants.all())
        return context

    def post(self, *args, **kwargs):

        data = {'title': self.request.POST.get('title'),
                'sku': self.request.POST.get('sku'),
                'description': self.request.POST.get('description')}
        form = ProductForm(data)
        if form.is_valid():
            product = form.save()

            if(product):
                try:
                    imageData = self.request.POST.getlist('productImage')[
                                                          0].split(",")
                    for image in imageData:
                        data = {'product': product.pk,
                                'file_path': image}

                        imageForm = ProductImageForm(data)
                        if imageForm.is_valid():
                            imageForm.save()
                        else:
                            print("imageForm.has_error", imageForm.has_error)

                except Exception as e:
                    print("Exception as e", e)
                    pass

                try:
                    productVariants = json.loads(
                         self.request.POST['productVariants'])

                    for variant in productVariants:

                        data = {
                            'product': product.pk,
                            'variant_title': variant['variant_title'],
                            'variant':variant['variant']
                        }
                        variantForm = ProductVariantForm(data)
                        if(variantForm.is_valid()):
                            variantForm.save()

                except Exception as e:
                    print("")

                try:
                    productVariantPrices = json.loads(
                    self.request.POST['productVariantPrices'])
                    for variantPrices in productVariantPrices:
                        title = variantPrices['title'].split("/")
                        ids = [''] * 3
                        
                        for i in range(0, len(title)-1):
                            temp = ProductVariant.objects.filter(variant_title=title[i].replace("/",""))
                            
                            #varaint title should be unique for each product so for now , just get the first one
                            ids[i] = temp[0].pk
                            
                        print("-----------------------------------")
                        data = {
                                "product_variant_one":ids[0] or None,
                                "product_variant_two":ids[1] or None,
                                "product_variant_three":ids[2]or None,
                                "price":variantPrices['price'],
                                "stock":variantPrices['stock'],
                                "product":product.pk
                                }
                        print(data)
                        variantPriceForm = ProductVariantPriceForm(data)
                        if(variantPriceForm.is_valid()):
                            variantPriceForm.save()
                        else:
                            print(variantPriceForm.errors)
                        
                except Exception as e:
                    print(e)
            else:
                return HttpResponse(status=400)
    
        return redirect("/product/list/")


class EditProductView(generic.TemplateView):
    template_name = 'products/edit.html'

    def get_context_data(self, **kwargs):
        context = super(EditProductView, self).get_context_data(**kwargs)
        variants = Variant.objects.filter(active=True).values('id', 'title')
        try:
            product = Product.objects.select_related('variantPrice_rel').get(id=self.kwargs['id'])
        except Exception as e:
            print(e)
            pass




        context['product'] =  list(product)
        context['variants'] = list(variants.all())
        return context

    def post(self,id, *args, **kwargs):

        data = {'title': self.request.POST.get('title'),
                'sku': self.request.POST.get('sku'),
                'description': self.request.POST.get('description')}
        form = ProductForm(data)
        if form.is_valid():
            product = form.save()

            if(product):
                try:
                    imageData = self.request.POST.getlist('productImage')[
                                                          0].split(",")
                    for image in imageData:
                        data = {'product': product.pk,
                                'file_path': image}

                        imageForm = ProductImageForm(data)
                        if imageForm.is_valid():
                            imageForm.save()
                        else:
                            print("imageForm.has_error", imageForm.has_error)

                except Exception as e:
                    print("Exception as e", e)
                    pass

                try:
                    productVariants = json.loads(
                         self.request.POST['productVariants'])

                    for variant in productVariants:

                        data = {
                            'product': product.pk,
                            'variant_title': variant['variant_title'],
                            'variant':variant['variant']
                        }
                        variantForm = ProductVariantForm(data)
                        if(variantForm.is_valid()):
                            variantForm.save()

                except Exception as e:
                    print("")

                try:
                    productVariantPrices = json.loads(
                    self.request.POST['productVariantPrices'])
                    for variantPrices in productVariantPrices:
                        title = variantPrices['title'].split("/")
                        ids = [''] * 3
                        
                        for i in range(0, len(title)-1):
                            temp = ProductVariant.objects.filter(variant_title=title[i].replace("/",""))
                            
                            #varaint title should be unique for each product so for now , just get the first one
                            ids[i] = temp[0].pk
                            
                        data = {
                                "product_variant_one":ids[0] or None,
                                "product_variant_two":ids[1] or None,
                                "product_variant_three":ids[2]or None,
                                "price":variantPrices['price'],
                                "stock":variantPrices['stock'],
                                "product":product.pk
                                }
                        print(data)
                        variantPriceForm = ProductVariantPriceForm(data)
                        if(variantPriceForm.is_valid()):
                            variantPriceForm.save()
                        else:
                            print(variantPriceForm.errors)
                        
                except Exception as e:
                    print(e)
            else:
                return HttpResponse(status=400)
    
        return redirect("/product/list/")


class ProductView(ListView):
    model = Product
    template_name = 'products/list.html'
    context_object_name = 'products'
    paginate_by = 5
    queryset = Product.objects.all()

    def get_queryset(self):
        filter_string = {}

        for key in self.request.GET:
            if self.request.GET.get(key):
                if key== "page":
                    pass
                elif key=="date":
                    filter_string["created_at__contains"] =  datetime.datetime.strptime(self.request.GET.get(key), "%Y-%m-%d").date()
                elif key=="price_to":
                    filter_string["variantPrice_rel__price__lte"] = int(self.request.GET.get(key))
                elif key=="price_from":
                    filter_string["variantPrice_rel__price__gte"] = int(self.request.GET.get(key)) 
                elif key=="variant":
                    filter_string["productToVariant_rel__variant_title"] = self.request.GET.get(key)
                elif key=="title":                    
                    filter_string["title__contains"] = self.request.GET.get(key)
        
        print(Product.objects.prefetch_related('variantPrice_rel').filter(**filter_string))
        return Product.objects.prefetch_related('variantPrice_rel').filter(**filter_string)


    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        variants = ProductVariant.objects.values('variant_title')
        context['product'] = True
        context['variants'] = list(variants.all())
        context['len'] = len(self.get_queryset())
        # if self.request.GET:
        #     context['request'] = self.request.GET['title__icontains']
        return context


