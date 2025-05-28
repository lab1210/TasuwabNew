"use client";
import Layout from "@/app/components/Layout";
import categoryService from "@/Services/categoryService";
import { getSupplierById, updateSupplier } from "@/Services/supplierService";
import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";
import Select from "react-select";

const EditSupplier = () => {
  const pathname = usePathname();
  const supplierId = pathname.split("/")[4];
  const [supplier, setSuppliers] = useState({});
  const [name, setName] = useState(supplier?.name || "");
  const [email, setEmail] = useState(supplier?.email || "");
  const [phone, setPhone] = useState(supplier?.phone || "");
  const [address, setAddress] = useState(supplier?.address || "");
  const [banks, setBanks] = useState([
    { label: "First Bank", value: "firstBank" },
    { label: "Access Bank", value: "accessBank" },
    { label: "Zenith Bank", value: "zenithBank" },
    { label: "Ecobank", value: "ecobank" },
  ]);
  const [selectedBank, setSelectedBank] = useState(
    supplier?.bank ? { label: supplier.bank, value: supplier.bank } : null
  );
  const [accountNumber, setAccountNumber] = useState(
    supplier?.accountNumber || ""
  );
  const [accountName, setAccountName] = useState(supplier?.accountName || "");
  const [categories, setCategories] = useState([]);

  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState({});

  // Fetch data for the supplier
  const fetchSupplierData = async (id) => {
    try {
      const data = await getSupplierById(id);
      setSuppliers(data);
      console.log("Fetched supplier data:", data);
    } catch (error) {
      console.error("Failed to fetch supplier data", error);
    }
  };

  useEffect(() => {
    if (supplierId) {
      fetchSupplierData(supplierId);
    } else {
      console.error("No supplier ID found in the URL");
    }
  }, []);

  useEffect(() => {
    if (supplier && supplier.categories) {
      setName(supplier.name || "");
      setEmail(supplier.email || "");
      setPhone(supplier.phone || "");
      setAddress(supplier.address || "");
      setSelectedBank(
        supplier.bank ? { label: supplier.bank, value: supplier.bank } : null
      );
      setAccountNumber(supplier.accountNumber || "");
      setAccountName(supplier.accountName || "");

      const selectedCats = supplier.categories.map((cat) => ({
        value: cat.id,
        label: cat.name,
      }));
      setSelectedCategories(selectedCats);

      const productMap = {};
      supplier.categories.forEach((cat) => {
        productMap[cat.id] = (cat.products || []).map((p) => ({
          id: p.id,
          name: p.name,
          price: p.price,
        }));
      });
      setSelectedProducts(productMap);
    }
  }, [supplier]);
  useEffect(() => {
    const fetchCategories = async () => {
      const cats = categoryService.getAllCategories();
      const formattedCats = (cats || []).map((cat) => ({
        value: cat.id,
        label: cat.name,
        products: (cat.products || []).map((p) => ({
          value: p.id,
          label: p.name,
        })),
      }));
      setCategories(formattedCats);
    };

    fetchCategories();
  }, []);

  const handleCategoryChange = (selected) => {
    setSelectedCategories(selected || []);
    const updated = {};
    (selected || []).forEach((cat) => {
      updated[cat.value] = selectedProducts[cat.value] || [];
    });
    setSelectedProducts(updated);
  };

  const handleProductChange = (catId, selected) => {
    setSelectedProducts((prev) => ({
      ...prev,
      [catId]: selected.map((p) => {
        const existing = (prev[catId] || []).find(
          (item) => item.id === p.value
        );
        return {
          id: p.value,
          name: p.label,
          price: existing ? existing.price : "",
        };
      }),
    }));
  };

  const handlePriceChange = (catId, productIndex, newPrice) => {
    const updated = [...(selectedProducts[catId] || [])];
    updated[productIndex].price = newPrice;
    setSelectedProducts((prev) => ({
      ...prev,
      [catId]: updated,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !name ||
      !email ||
      !selectedBank ||
      !accountNumber ||
      !accountName ||
      accountName === "Invalid account"
    ) {
      alert("Please fill in all required fields with valid information.");
      return;
    }

    const payload = {
      id: supplierId,
      name,
      email,
      phone,
      address,
      bank: selectedBank.label,
      accountNumber,
      accountName,
      categories: selectedCategories.map((cat) => ({
        id: cat.value,
        name: cat.label,
        products: (selectedProducts[cat.value] || []).map((p) => ({
          id: p.id,
          name: p.name,
          price: p.price,
        })),
      })),
    };

    try {
      await updateSupplier(payload);
      alert("Supplier updated successfully!");
    } catch (err) {
      alert("Failed to update supplier.");
    }
  };

  return (
    <Layout>
      <div className="w-full">
        <div>
          <p className="text-4xl font-extrabold mb-2">Edit Supplier</p>
          <p className="text-sm text-gray-600">
            Fill in the form below to update existing supplier information.
          </p>
        </div>
        <form className="mt-6" onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-2">
              <label className="font-bold text-sm" htmlFor="name">
                Supplier Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="border focus:border-2 border-gray-400 focus:border-[#3D873B] outline-none shadow-md p-2 rounded-md"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-bold text-sm" htmlFor="email">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border focus:border-2 border-gray-400 focus:border-[#3D873B] outline-none shadow-md p-2 rounded-md"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-bold text-sm" htmlFor="phone">
                Phone <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                name="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="border focus:border-2 border-gray-400 focus:border-[#3D873B] outline-none shadow-md p-2 rounded-md"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-bold text-sm" htmlFor="address">
                Address <span className="text-red-500">*</span>
              </label>
              <input
                type="address"
                name="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="border focus:border-2 border-gray-400 focus:border-[#3D873B] outline-none shadow-md p-2 rounded-md"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-bold text-sm" htmlFor="bank">
                Bank <span className="text-red-500">*</span>
              </label>
              <Select
                options={banks}
                value={selectedBank}
                onChange={setSelectedBank}
                placeholder="Select Bank"
                isClearable
                isSearchable
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
            <div className="flex flex-col gap-2">
              <label className="font-bold text-sm" htmlFor="accountNumber">
                Account Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                maxLength={10}
                name="accountNumber"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                className="border focus:border-2 border-gray-400 focus:border-[#3D873B] outline-none shadow-md p-2 rounded-md"
              />
              {accountName && (
                <p className="font-bold text-sm">
                  Account Name:{" "}
                  <span
                    className={`${
                      accountName === "Invalid account"
                        ? "text-red-500"
                        : "text-[#3D873B]"
                    } `}
                  >
                    {accountName}
                  </span>{" "}
                </p>
              )}
            </div>
          </div>
          <div className="mt-4">
            <div>
              <label className="font-bold text-sm" htmlFor="categories">
                Categories
              </label>
              <Select
                isMulti
                options={categories}
                value={selectedCategories}
                onChange={handleCategoryChange}
                placeholder="Select categories..."
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
            {selectedCategories.map((cat, index) => (
              <div key={index} className="mb-6 mt-4">
                <label htmlFor="products" className="font-bold text-sm">
                  Product under {cat.label} category
                </label>
                <Select
                  isMulti
                  options={cat.products}
                  value={(selectedProducts[cat.value] || []).map((p) => ({
                    value: p.id,
                    label: p.name,
                  }))}
                  placeholder="Select products..."
                  onChange={(selected) =>
                    handleProductChange(cat.value, selected)
                  }
                  styles={{
                    control: (base, state) => ({
                      ...base,
                      borderColor: state.isFocused
                        ? "#3D873B"
                        : base.borderColor,
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
                {(selectedProducts[cat.value] || []).map((product, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-evenly gap-4 mt-2"
                  >
                    <span className="font-bold text-gray-500">
                      {product.name}
                    </span>
                    <input
                      type="number"
                      placeholder="Enter price"
                      value={product.price}
                      onChange={(e) =>
                        handlePriceChange(cat.value, index, e.target.value)
                      }
                      className="border focus:border-2 border-gray-400 focus:border-[#3D873B] outline-none shadow-md p-2 rounded-md"
                    />
                  </div>
                ))}
              </div>
            ))}
          </div>
          <div className="flex items-center justify-end mt-6">
            <button
              type="submit"
              className="text-white bg-[#3D873B] px-4 py-2 rounded-md shadow-md hover:opacity-95 cursor-pointer transition-colors duration-200"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default EditSupplier;
