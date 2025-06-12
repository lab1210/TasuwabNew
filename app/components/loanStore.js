import { create } from "zustand";
import { persist } from "zustand/middleware";

const useLoanStore = create(
  persist(
    (set, get) => ({
      // Start with null like your original setup
      loanFormData: null,

      // Helper to create empty form structure
      createEmptyFormData: () => ({
        name: "",
        assetName: "",
        filename: "",
        dob: "",
        phone: "",
        email: "",
        address: "",
        businessName: "",
        date: "",
        loanDetails: "",
        ownershipType: "",
        otherInfo: "",
        employerId: "",
        numberOfStaffs: "",
        businessStartupDate: "",
        loanType: "",
        loanAmount: "",
        paymentPeriodInMonths: "",
        assetDescription: "",
        assetQuantity: "",
        assetPrice: "",
        preferredSupplier: "",
        supplierQuote: "",
        forms: {
          statementOfAccount: null,
          idCard: null,
          passport: null,
          loanInvoice: null,
          physicalFormUpload: null,
        },
        guarantors: [
          {
            name: "",
            occupation: "",
            phone: "",
            address: "",
            relationship: "",
            forms: {
              idCard: null,
              passport: null,
              formUpload: null,
            },
          },
          {
            name: "",
            occupation: "",
            phone: "",
            address: "",
            relationship: "",
            forms: {
              idCard: null,
              passport: null,
              formUpload: null,
            },
          },
        ],
      }),

      // Initialize with empty structure if needed
      initializeLoanFormData: () => {
        const currentData = get().loanFormData;
        if (!currentData) {
          set({ loanFormData: get().createEmptyFormData() });
        }
      },

      // Set complete loan form data
      setLoanFormData: (data) => set({ loanFormData: data }),

      // Update specific fields
      updateLoanFormData: (updates) =>
        set((state) => ({
          loanFormData: state.loanFormData
            ? { ...state.loanFormData, ...updates }
            : { ...get().createEmptyFormData(), ...updates },
        })),

      // Clear all data
      clearLoanFormData: () => set({ loanFormData: null }),
    }),
    {
      name: "loan-store", // localStorage key
      // Optional: Skip persisting helper functions
      partialize: (state) => ({
        loanFormData: state.loanFormData,
      }),
    }
  )
);

export default useLoanStore;
