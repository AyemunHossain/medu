import React, { useState } from "react";
import TagsInput from "react-tagsinput";
import "react-tagsinput/react-tagsinput.css";
import Dropzone from "react-dropzone";
import axios from "axios";
import { useNavigate } from "react-router";

//axios configuration for csrf token
axios.defaults.xsrfHeaderName = "X-CSRFTOKEN";
axios.defaults.xsrfCookieName = "csrftoken";

const CREATE_PRODUCT = "http://127.0.0.1:8000/product/create/";
const FILE_ROOT = "http://127.0.0.1:8000/";

const EditProduct = (props) => {
  const [productVariantPrices, setProductVariantPrices] = useState([]);
  const [productName, setProductName] = useState("");
  const [productSKU, setProductSKU] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [productImage, setProductImage] = useState([]);

  const [productVariants, setProductVariant] = useState([
    {
      option: 1,
      tags: [],
      id: null,
    },
  ]);
  console.log(props);
  // handle click event of the Add button
  const handleAddClick = () => {
    let all_variants = JSON.parse(props.variants.replaceAll("'", '"')).map(
      (el) => el.id
    );
    let selected_variants = productVariants.map((el) => el.option);
    let available_variants = all_variants.filter(
      (entry1) => !selected_variants.some((entry2) => entry1 == entry2)
    );
    console.log(productVariants);
    setProductVariant([
      ...productVariants,
      {
        option: available_variants[0],
        tags: [],
      },
    ]);
  };

  // handle input change on tag input
  const handleInputTagOnChange = (value, index) => {
    let product_variants = [...productVariants];

    product_variants[index].tags = value;
    product_variants[index].id = JSON.parse(
      props.variants.replaceAll("'", '"')
    )[index].id;
    setProductVariant(product_variants);

    checkVariant();
  };

  // remove product variant
  const removeProductVariant = (index) => {
    let product_variants = [...productVariants];
    product_variants.splice(index, 1);
    setProductVariant(product_variants);
  };

  // check the variant and render all the combination
  const checkVariant = () => {
    let tags = [];

    productVariants.filter((item) => {
      tags.push(item.tags);
    });

    setProductVariantPrices([]);

    getCombn(tags).forEach((item) => {
      setProductVariantPrices((productVariantPrice) => [
        ...productVariantPrice,
        {
          title: item,
          price: 0,
          stock: 0,
        },
      ]);
    });
  };

  let changePrice = (index, price) => {
    let pricess = [...productVariantPrices];
    pricess[index].price = price;
    setProductVariantPrices(pricess);
  };

  let changeStock = (index, stock) => {
    let pricess = [...productVariantPrices];
    pricess[index].stock = stock;
    setProductVariantPrices(pricess);
  };

  // combination algorithm
  function getCombn(arr, pre) {
    pre = pre || "";
    if (!arr.length) {
      return pre;
    }
    let ans = arr[0].reduce(function (ans, value) {
      return ans.concat(getCombn(arr.slice(1), pre + value + "/"));
    }, []);
    return ans;
  }

  // Save product
  let saveProduct = (event) => {
    event.preventDefault();
    // TODO : write your code here to save the product

    let submitProductVariants = [];

    productVariants.forEach((f) => {
      let d = "";
      f.tags.forEach((f2) => {
        submitProductVariants.push({ variant_title: f2, variant: f.id });
      });
    });

    console.log("productVariantPrices", productVariantPrices);

    let formData = new FormData();
    formData.append("title", productName);
    formData.append("sku", productSKU);
    formData.append("description", productDescription);
    formData.append(
      "productVariantPrices",
      JSON.stringify(productVariantPrices)
    );
    formData.append("productVariants", JSON.stringify(submitProductVariants));
    formData.append("productImage", productImage);

    for (const value of formData.values()) {
      console.log(value);
    }

    axios
      .post(CREATE_PRODUCT, formData, {
        headers: { "content-type": "multipart/form-data" },
      })
      .then(function (response) {
        if (response.status == 200) {
          alert("Product Created Successfully");
          setProductVariantPrices([]);
          setProductName("");
          setProductSKU("");
          setProductDescription("");
          setProductImage("");
          setProductVariant([
            {
              option: 1,
              tags: [],
              id: null,
            },
          ]);
        }
      })
      .catch(function (error) {
        console.log(error);
      });
  };

  //Hanle image upload
  let onChangeImage = (file) => {
    let d = file.map((f) => {
      return FILE_ROOT + f.path.replace(/ /g, "-");
    });
    console.log("d", d);
    setProductImage(d);
  };

  return (
    <form onSubmit={saveProduct}>
      <section>
        <div className="row">
          <div className="col-md-6">
            <div className="card shadow mb-4">
              <div className="card-body">
                <div className="form-group">
                  <label htmlFor="">Product Name</label>
                  <input
                    required
                    type="text"
                    placeholder="Product Name"
                    className="form-control"
                    value={productName}
                    onChange={(e) => {
                      setProductName(e.target.value);
                    }}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="">Product SKU</label>
                  <input
                    required
                    type="text"
                    placeholder="Product SKU"
                    className="form-control"
                    value={productSKU}
                    onChange={(e) => {
                      setProductSKU(e.target.value);
                    }}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="">Description</label>
                  <textarea
                    id=""
                    cols="30"
                    rows="4"
                    className="form-control"
                    value={productDescription}
                    onChange={(e) => {
                      setProductDescription(e.target.value);
                    }}
                  ></textarea>
                </div>
              </div>
            </div>

            <div className="card shadow mb-4">
              <div className="card-header py-3 d-flex flex-row align-items-center justify-content-between">
                <h6 className="m-0 font-weight-bold text-primary">Media</h6>
              </div>
              <div className="card-body border">
                <Dropzone
                  onDrop={(acceptedFiles) => onChangeImage(acceptedFiles)}
                >
                  {({ getRootProps, getInputProps }) => (
                    <section>
                      <div {...getRootProps()}>
                        <input {...getInputProps()} />
                        <p>
                          Drag 'n' drop some files here, or click to select
                          files
                        </p>
                      </div>
                    </section>
                  )}
                </Dropzone>
              </div>
            </div>
          </div>

          <div className="col-md-6">
            <div className="card shadow mb-4">
              <div className="card-header py-3 d-flex flex-row align-items-center justify-content-between">
                <h6 className="m-0 font-weight-bold text-primary">Variants</h6>
              </div>
              <div className="card-body">
                {productVariants.map((element, index, id) => {
                  return (
                    <div className="row" key={index}>
                      <div className="col-md-4">
                        <div className="form-group">
                          <label htmlFor="">Option</label>
                          <select
                            className="form-control"
                            defaultValue={element.option}
                          >
                            {JSON.parse(
                              props.variants.replaceAll("'", '"')
                            ).map((variant, index) => {
                              return (
                                <option key={index} value={variant.id}>
                                  {variant.title}
                                </option>
                              );
                            })}
                          </select>
                        </div>
                      </div>

                      <div className="col-md-8">
                        <div className="form-group">
                          {productVariants.length > 1 ? (
                            <label
                              htmlFor=""
                              className="float-right text-primary"
                              style={{ marginTop: "-30px" }}
                              onClick={() => removeProductVariant(index)}
                            >
                              remove
                            </label>
                          ) : (
                            ""
                          )}

                          <section style={{ marginTop: "30px" }}>
                            <TagsInput
                              value={element.tags}
                              style="margin-top:30px"
                              onChange={(value) =>
                                handleInputTagOnChange(value, index)
                              }
                            />
                          </section>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="card-footer">
                {productVariants.length !== 3 ? (
                  <button className="btn btn-primary" onClick={handleAddClick}>
                    Add another option
                  </button>
                ) : (
                  ""
                )}
              </div>

              <div className="card-header text-uppercase">Preview</div>
              <div className="card-body">
                <div className="table-responsive">
                  <table className="table">
                    <thead>
                      <tr>
                        <td>Variant</td>
                        <td>Price</td>
                        <td>Stock</td>
                      </tr>
                    </thead>
                    <tbody>
                      {productVariantPrices.map(
                        (productVariantPrice, index) => {
                          return (
                            <tr key={index}>
                              <td>{productVariantPrice.title}</td>
                              <td>
                                <input
                                  required
                                  className="form-control"
                                  type="number"
                                  onChange={(e) =>
                                    changePrice(index, e.target.value)
                                  }
                                />
                              </td>
                              <td>
                                <input
                                  required
                                  className="form-control"
                                  type="number"
                                  onChange={(e) =>
                                    changeStock(index, e.target.value)
                                  }
                                />
                              </td>
                            </tr>
                          );
                        }
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>

        <button type="submit" className="btn btn-lg btn-primary">
          Save
        </button>
        <button type="button" className="btn btn-secondary btn-lg">
          Cancel
        </button>
      </section>
    </form>
  );
};

export default EditProduct;
