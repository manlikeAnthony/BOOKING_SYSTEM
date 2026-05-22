interface CreatePropertyInput {
  title: string;
  price: number;
  type: string;
  address: {
    street: string;
    city: string;
    state: string;
  };
  images?: string[];
  // add the rest
}