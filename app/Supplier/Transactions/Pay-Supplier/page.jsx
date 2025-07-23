"use client";
import React, { useState, useEffect } from "react";
import { useAuth } from "@/Services/authService";
import supplierService from "@/Services/supplierService";
import loanService from "@/Services/loanService";
import supplierTransactionService from "@/Services/supplierTransactionService";
import bankService from "@/Services/bankService";
import productService from "@/Services/productService";
import categoryService from "@/Services/categoryService";
import { toast } from "react-hot-toast";
import Select from "react-select";
import Layout from "@/app/components/Layout";
import { useRouter } from "next/navigation";

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);

const AddSupplierTransaction = () => {
  const { user } = useAuth();
  const [suppliers, setSuppliers] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [supplierLoans, setSupplierLoans] = useState([]);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [allProducts, setAllProducts] = useState([]);
  const [allCategories, setAllCategories] = useState([]);
  const [banks, setBanks] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const [formData, setFormData] = useState({
    accountCode: "",
    supplierId: "",
    productId: "",
    amount: 0,
    sendingBank: "",
    notes: "",
    fileNo: "",
    performedBy: user?.StaffCode || "",
    categoryId: "",
  });

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [suppliersData, banksData, productsData, categoriesData] =
          await Promise.all([
            supplierService.getSuppliers(),
            bankService.getBank(),
            productService.getAllProducts(),
            categoryService.getCategories(),
          ]);
        setSuppliers(suppliersData);
        setBanks(banksData);
        setAllProducts(productsData);
        console.log("Fetched all products:", productsData);
        setAllCategories(categoriesData);
      } catch (error) {
        toast.error("Failed to load initial data");
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // Fetch loans when supplier changes
  useEffect(() => {
    if (!selectedSupplier) return;

    const fetchSupplierLoans = async () => {
      try {
        const loans = await loanService.getLoans();
        const filteredLoans = loans.filter(
          (loan) =>
            loan.supplierId === selectedSupplier.value &&
            loan.status === "Approved"
        );
        setSupplierLoans(filteredLoans);
      } catch (error) {
        toast.error("Failed to load supplier loans");
        console.error(error);
      }
    };

    fetchSupplierLoans();
  }, [selectedSupplier]);

  // Update form data when loan is selected
  useEffect(() => {
    if (!selectedLoan) return;

    const findProductDetails = () => {
      if (!selectedLoan.assetName) return { productId: "", categoryId: "" };

const product = allProducts.find((p) =>
  p.name.toLowerCase().includes(selectedLoan.assetName.toLowerCase())
);

console.log("🔍 Selected Loan Asset:", selectedLoan.assetName);
  console.log("📦 Available Products:", allProducts.map(p => p.name));
  console.log("✅ Matched Product:", product);

      return {
        productId: product ? product.id : "",
        categoryId: product ? product.categoryId : "",
      };
    };

    const productDetails = findProductDetails();

    setFormData((prev) => ({
      ...prev,
      accountCode: selectedLoan.accountCode,
      supplierId: selectedLoan.supplierId,
      productId: productDetails.productId,
      categoryId: productDetails.categoryId,
      amount: selectedLoan.initialAmount,
      fileNo: selectedLoan.fileNo,
    }));
  }, [selectedLoan, allProducts]);

  const handleSupplierChange = (selectedOption) => {
    setSelectedSupplier(selectedOption);
    setSelectedLoan(null);
    setSupplierLoans([]);
    setFormData((prev) => ({
      ...prev,
      supplierId: selectedOption.value,
      accountCode: "",
      productId: "",
      categoryId: "",
      amount: 0,
      fileNo: "",
    }));
  };

  const handleLoanChange = (selectedOption) => {
    setSelectedLoan(selectedOption.loan);
  };

  const handleBankChange = (selectedOption) => {
    setFormData((prev) => ({
      ...prev,
      sendingBank: selectedOption.value,
    }));
  };

  const handleCategoryChange = (selectedOption) => {
    setFormData((prev) => ({
      ...prev,
      categoryId: selectedOption.value,
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "amount" && selectedLoan) return;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await supplierTransactionService.createSupplierTransaction(formData);
      toast.success("Supplier transaction created successfully!");
      setFormData({
        accountCode: "",
        supplierId: "",
        productId: "",
        amount: 0,
        sendingBank: "",
        notes: "",
        fileNo: "",
        performedBy: user?.StaffCode || "",
        categoryId: "",
      });
      setSelectedSupplier(null);
      setSelectedLoan(null);
      setSupplierLoans([]);
      router.push("/Suppliers/Transactions");
    } catch (error) {
      toast.error(error.message || "Failed to create supplier transaction");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Prepare dropdown options
  const supplierOptions = suppliers.map((supplier) => ({
    value: supplier.id,
    label: `${supplier.name}`,
    supplier,
  }));

  const loanOptions = supplierLoans.map((loan) => ({
    value: loan.id,
    label: `File No: ${loan.fileNo} - ${loan.businessName} (${formatCurrency(
      loan.initialAmount
    )})`,
    loan,
  }));

  const bankOptions = banks.map((bank) => ({
    value: bank.id,
    label: `${bank.bankName} - ${bank.accountNumber} - ${bank.accountName}`,
  }));

  const categoryOptions = allCategories.map((category) => ({
    value: category.id,
    label: category.name,
  }));

  return (
    <Layout>
      <div className="w-full">
        <h1 className="text-2xl font-bold mb-6">Add Supplier Transaction</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Supplier Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Supplier <span className="text-red-500">*</span>
              </label>
              <Select
                options={supplierOptions}
                value={selectedSupplier}
                onChange={handleSupplierChange}
                placeholder="Select supplier"
                isLoading={isLoading}
                required
              />
            </div>

            {selectedSupplier && (
              <div className="bg-[#3D873B]/90 text-white p-4 rounded-md">
                <h3 className="font-medium">Supplier Information</h3>
                <p>
                  Account: {selectedSupplier.supplier.supplierAccountNumber}
                </p>
                <p>Bank: {selectedSupplier.supplier.supplierBankName}</p>
                <p>Phone: {selectedSupplier.supplier.phone}</p>
                <p>Email: {selectedSupplier.supplier.email}</p>
              </div>
            )}
          </div>

          {/* Approved Loans */}
          {selectedSupplier && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Approved Loans <span className="text-red-500">*</span>
              </label>
              <Select
                options={loanOptions}
                value={loanOptions.find(
                  (option) => option.value === selectedLoan?.id
                )}
                onChange={handleLoanChange}
                placeholder="Select approved loan"
                required
              />
            </div>
          )}

          {/* Selected Loan Info */}
          {selectedLoan && (
            <div className="bg-gray-100 p-4 rounded-md space-y-2">
              <h3 className="font-medium">Loan Information</h3>
              <p>File No: {selectedLoan.fileNo}</p>
              <p>Business: {selectedLoan.businessName}</p>
              <p>Amount: {formatCurrency(selectedLoan.initialAmount)}</p>
              <p>Product: {selectedLoan.assetName || "N/A"}</p>
            </div>
          )}

          {/* Transaction Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                File Number
              </label>
              <input
                type="text"
                name="fileNo"
                value={formData.fileNo}
                onChange={handleInputChange}
                className="w-full border rounded-md px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Amount <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleInputChange}
                className="w-full border rounded-md px-3 py-2 bg-gray-100"
                required
                min="0"
                disabled={!!selectedLoan}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sending Bank <span className="text-red-500">*</span>
              </label>
              <Select
                options={bankOptions}
                onChange={handleBankChange}
                placeholder="Select bank"
                required
              />
            </div>

            <div className="hidden">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <Select
                options={categoryOptions}
                value={categoryOptions.find(
                  (opt) => opt.value === formData.categoryId
                )}
                onChange={handleCategoryChange}
                placeholder="Select category"
              />
            </div>
          </div>

          {/* Hidden Product ID */}
          <div className="hidden">
            <input
              type="text"
              name="productId"
              value={formData.productId}
              onChange={handleInputChange}
              disabled
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              className="w-full border rounded-md px-3 py-2"
              rows={3}
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400"
            >
              {isSubmitting ? "Submitting..." : "Submit Transaction"}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default AddSupplierTransaction;
