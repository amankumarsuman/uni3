import { useMutation } from "react-query";
// import {rental_get_tax, trip_booking} from "components/home/module-wise-components/rental/rental-api-manage/ApiRoutes";
import MainApi from "api-manage/MainApi";
import {tax_api} from "api-manage/ApiRoutes";

const getTax = async (orderData) => {
  const { data } = await MainApi.post(`${tax_api}`, orderData);
  return data;
};
export const useGetTax = () => {
  return useMutation("get-t", getTax);
};
