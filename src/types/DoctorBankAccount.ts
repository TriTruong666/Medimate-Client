export type DoctorBankAccount = {
  bankAccountId: string;
  doctorId: string;
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  createdAt?: string;
};

export type UpsertDoctorBankAccountRequest = {
  bankName: string;
  accountNumber: string;
  accountHolder: string;
};
