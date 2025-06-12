"use client";
import Layout from "@/app/components/Layout";
import dummyClients from "@/app/Loan/DummyClient";
import dummyLoans from "@/app/Loan/DummyLoan";
import { getSuppliers } from "@/Services/supplierService";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Select from "react-select";

const AddSupplierTransaction = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const router = useRouter();
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [selectedClient, setSelectedClient] = useState(null);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [bankDetails, setBankDetails] = useState({
    bankName: "",
    accountNumber: "",
    accountName: "",
  });
  const [formData, setFormData] = useState({
    transactionId: "",
    name: "",
    amount: "",
    ClientName: "",
    date: "",
    status: "",
    categories: [],
  });
  // Generate transaction ID on component mount
  useEffect(() => {
    const generateTransactionId = () => {
      const timestamp = Date.now().toString().slice(-6); // Last 6 digits of timestamp
      const randomNum = Math.floor(Math.random() * 1000)
        .toString()
        .padStart(3, "0");
      return `TXN${timestamp}${randomNum}`;
    };

    setFormData((prev) => ({
      ...prev,
      transactionId: generateTransactionId(),
      date: new Date().toISOString().split("T")[0], // Set current date as default
    }));
  }, []);

  useEffect(() => {
    const supplierData = getSuppliers();
    const formattedSupplier = supplierData.map((supply) => ({
      value: supply.id,
      label: supply.name,
      data: supply, // Store the full supplier data for later use
    }));
    setSuppliers(formattedSupplier);
  }, []);

  // When supplier changes, update categories
  useEffect(() => {
    if (selectedSupplier) {
      const supplierCategories = selectedSupplier.data.categories.map(
        (cat) => ({
          value: cat.id,
          label: cat.name,
          data: cat, // Store full category data
        })
      );
      setCategories(supplierCategories);
      setSelectedCategories([]);
      setProducts([]);
      setSelectedProducts([]);
    } else {
      setCategories([]);
      setSelectedCategories([]);
      setProducts([]);
      setSelectedProducts([]);
    }
  }, [selectedSupplier]);

  // When categories change, update products
  useEffect(() => {
    if (selectedCategories.length > 0) {
      const allProducts = [];
      selectedCategories.forEach((cat) => {
        allProducts.push(
          ...cat.data.products.map((prod) => ({
            value: prod.id,
            label: prod.name,
            data: prod, // Store full product data
            categoryId: cat.value, // Link product to category
          }))
        );
      });
      setProducts(allProducts);
      setSelectedProducts([]);
    } else {
      setProducts([]);
      setSelectedProducts([]);
    }
  }, [selectedCategories]);

  const handleSupplierChange = (selectedOption) => {
    setSelectedSupplier(selectedOption);
    setFormData((prev) => ({
      ...prev,
      name: selectedOption?.label || "",
    }));

    // Update bank details when supplier is selected
    if (selectedOption) {
      const supplierData = selectedOption.data;
      setBankDetails({
        bankName: supplierData.bank,
        accountNumber: supplierData.accountNumber,
        accountName: supplierData.accountName,
      });
    } else {
      setBankDetails({
        bankName: "",
        accountNumber: "",
        accountName: "",
      });
    }
  };

  const handleCategoryChange = (selectedOptions) => {
    setSelectedCategories(selectedOptions || []);
  };

  const handleProductChange = (selectedOptions) => {
    setSelectedProducts(selectedOptions || []);

    // Update formData with selected products
    const updatedCategories = selectedOptions.reduce((acc, product) => {
      const categoryId = product.categoryId;
      const existingCategory = acc.find((cat) => cat.id === categoryId);

      const productData = {
        id: product.value,
        name: product.label,
        quantity: "",
        price: product.data.price,
      };

      if (existingCategory) {
        existingCategory.products.push(productData);
      } else {
        const category = selectedCategories.find(
          (cat) => cat.value === categoryId
        );
        acc.push({
          id: categoryId,
          name: category.label,
          products: [productData],
        });
      }

      return acc;
    }, []);

    setFormData((prev) => ({
      ...prev,
      categories: updatedCategories,
    }));
  };

  const handleProductInputChange = (productId, categoryId, field, value) => {
    setFormData((prev) => {
      const updatedCategories = prev.categories.map((category) => {
        if (category.id === categoryId) {
          const updatedProducts = category.products.map((product) => {
            if (product.id === productId) {
              return { ...product, [field]: value };
            }
            return product;
          });
          return { ...category, products: updatedProducts };
        }
        return category;
      });

      return { ...prev, categories: updatedCategories };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Calculate total amount from selected products
      const totalAmount = formData.categories.reduce((total, category) => {
        return (
          total +
          category.products.reduce((categoryTotal, product) => {
            return categoryTotal + product.quantity * product.price;
          }, 0)
        );
      }, 0);

      // Prepare the transaction data
      const transactionData = {
        ...formData,
        supplierId: selectedSupplier.value,
        amount: totalAmount,
        status: "Pending", // Default status
        date: formData.date || new Date().toISOString().split("T")[0],
      };

      toast.success("Transaction submitted successfully!");

      // Reset form or redirect
      router.push("/Supplier/Transactions"); // Adjust to your transactions list route
    } catch (error) {
      toast.error("Failed to submit transaction. Please try again.");
    }
  };

  const clientOptions = dummyLoans
    .filter((loan) => loan.purpose === "Asset Financing" && loan.loanId) // loanId implies an existing loan
    .map((loan) => ({
      value: loan.clientId,
      label: loan.name,
    }));

  return (
    <Layout>
      <div className="w-full">
        <div>
          <p className="text-4xl font-extrabold mb-2">Pay Supplier</p>
          <p className="text-sm text-gray-600">
            Fill in the form below to make supplier payments.
          </p>
          <div className="mt-2 p-2 bg-gray-100 rounded">
            <span className="font-bold">Transaction ID:</span>{" "}
            {formData.transactionId}
          </div>
          <div className="mt-2 p-2 bg-gray-100 rounded">
            <span className="font-bold">Date:</span> {formData.date}
          </div>
        </div>
        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-2">
            <label className="font-bold text-sm" htmlFor="name">
              Client Name
            </label>
            <Select
              isClearable
              isSearchable
              options={clientOptions}
              value={selectedClient}
              onChange={(selectedOption) => setSelectedClient(selectedOption)}
              placeholder="Select a Client..."
              styles={{
                control: (base, state) => ({
                  ...base,
                  borderColor: state.isFocused ? "#3D873B" : base.borderColor,
                  boxShadow: state.isFocused
                    ? "0 0 0 1px green"
                    : base.boxShadow,
                  "&:hover": {
                    borderColor: state.isFocused ? "#3D873B" : base.borderColor,
                  },
                }),
              }}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-bold text-sm" htmlFor="name">
              Supplier Name
            </label>
            <Select
              isClearable
              isSearchable
              options={suppliers}
              value={selectedSupplier}
              onChange={handleSupplierChange}
              placeholder="Select a Supplier..."
              styles={{
                control: (base, state) => ({
                  ...base,
                  borderColor: state.isFocused ? "#3D873B" : base.borderColor,
                  boxShadow: state.isFocused
                    ? "0 0 0 1px green"
                    : base.boxShadow,
                  "&:hover": {
                    borderColor: state.isFocused ? "#3D873B" : base.borderColor,
                  },
                }),
              }}
            />
          </div>
          {selectedSupplier && (
            <div className="p-4 border-gray-900 border rounded-lg bg-gray-50">
              <h3 className="font-bold text-lg mb-2">Supplier Bank Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-sm block mb-1">
                    Bank Name
                  </label>
                  <input
                    type="text"
                    className="w-full p-2 border rounded bg-gray-100"
                    value={bankDetails.bankName}
                    readOnly
                  />
                </div>
                <div>
                  <label className="font-bold text-sm block mb-1">
                    Account Number
                  </label>
                  <input
                    type="text"
                    className="w-full p-2 border rounded bg-gray-100"
                    value={bankDetails.accountNumber}
                    readOnly
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="font-bold text-sm block mb-1">
                    Account Name
                  </label>
                  <input
                    type="text"
                    className="w-full p-2 border rounded bg-gray-100"
                    value={bankDetails.accountName}
                    readOnly
                  />
                </div>
              </div>
            </div>
          )}

          {categories.length > 0 && (
            <div className="flex flex-col gap-2">
              <label className="font-bold text-sm">Categories</label>
              <Select
                isMulti
                options={categories}
                value={selectedCategories}
                onChange={handleCategoryChange}
                placeholder="Select Categories..."
                styles={{
                  control: (base, state) => ({
                    ...base,
                    borderColor: state.isFocused ? "#3D873B" : base.borderColor,
                    boxShadow: state.isFocused
                      ? "0 0 0 1px green"
                      : base.boxShadow,
                    "&:hover": {
                      borderColor: state.isFocused
                        ? "#3D873B"
                        : base.borderColor,
                    },
                  }),
                }}
              />
            </div>
          )}

          {products.length > 0 && (
            <div className="flex flex-col gap-2">
              <label className="font-bold text-sm">Products</label>
              <Select
                isMulti
                options={products}
                value={selectedProducts}
                onChange={handleProductChange}
                placeholder="Select Products..."
                styles={{
                  control: (base, state) => ({
                    ...base,
                    borderColor: state.isFocused ? "#3D873B" : base.borderColor,
                    boxShadow: state.isFocused
                      ? "0 0 0 1px green"
                      : base.boxShadow,
                    "&:hover": {
                      borderColor: state.isFocused
                        ? "#3D873B"
                        : base.borderColor,
                    },
                  }),
                }}
              />
            </div>
          )}

          {formData.categories.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-bold text-lg">Selected Products</h3>
              {formData.categories.map((category) => (
                <div key={category.id} className="space-y-2">
                  <h4 className="font-semibold">{category.name}</h4>
                  {category.products.map((product) => (
                    <div
                      key={product.id}
                      className="grid grid-cols-3 gap-4 items-end"
                    >
                      <div>
                        <label className="font-bold text-sm">Product</label>
                        <input
                          type="text"
                          className="w-full p-2 border rounded"
                          value={product.name}
                          readOnly
                        />
                      </div>
                      <div>
                        <label className="font-bold text-sm">Quantity</label>
                        <input
                          type="number"
                          className="w-full p-2 border rounded"
                          value={product.quantity}
                          onChange={(e) =>
                            handleProductInputChange(
                              product.id,
                              category.id,
                              "quantity",
                              e.target.value
                            )
                          }
                        />
                      </div>
                      <div>
                        <label className="font-bold text-sm">Price</label>
                        <input
                          type="number"
                          className="w-full p-2 border rounded"
                          value={product.price}
                          onChange={(e) =>
                            handleProductInputChange(
                              product.id,
                              category.id,
                              "price",
                              e.target.value
                            )
                          }
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
          <div className="flex justify-end mt-6">
            <button
              type="submit"
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded"
              disabled={!selectedSupplier || selectedProducts.length === 0}
            >
              Submit Payment
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default AddSupplierTransaction;
