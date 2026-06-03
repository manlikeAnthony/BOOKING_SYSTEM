export interface CreateGuestDto {
  fullName: string;
  phone: string;
  gender: "MALE" | "FEMALE" | "FOOL";
  idType?: string;
  idNumber?: string;
  notes?: string;
}
