import { useTheme } from "@emotion/react";
import { alpha, Grid, Typography, useMediaQuery } from "@mui/material";
import { Stack } from "@mui/system";
import { baseUrl } from "api-manage/MainApi";
import { OrderApi } from "api-manage/another-formated-api/orderApi";
import { ProfileApi } from "api-manage/another-formated-api/profileApi";
import {
  onErrorResponse,
  onSingleErrorResponse,
} from "api-manage/api-error-response/ErrorResponses";
import { GoogleApi } from "api-manage/hooks/react-query/googleApi";
import { useOfflinePayment } from "api-manage/hooks/react-query/offlinePayment/useOfflinePayment";
import { getCurrentModuleType } from "helper-functions/getCurrentModuleType";
import { getStoresOrRestaurants } from "helper-functions/getStoresOrRestaurants";
import { getGuestId, getToken } from "helper-functions/getToken";
import moment from "moment/moment";
import Router from "next/router";
import React, { useEffect, useReducer, useState,useRef } from "react";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { useMutation, useQuery } from "react-query";
import { useDispatch, useSelector } from "react-redux";
import { setClearCart, setRemoveItemFromCart } from "redux/slices/cart";
import {
  setOfflineInfoStep,
  setOfflineMethod,
  setOrderDetailsModal,
} from "redux/slices/offlinePaymentData";
import SimpleBar from "simplebar-react";
import "simplebar-react/dist/simplebar.min.css";
import {
  CustomPaperBigCard,
  CustomStackFullWidth,
} from "styled-components/CustomStyles.style";
import {
  formatPhoneNumber,
  getDayNumber,
  getDigitalMethodFromZone,
  getFinalTotalPrice,
  getInfoFromZoneData,
  getProductDiscount,
  getTaxableTotalPrice,
  getVariation,
  handleDistance,
  isAvailable,
  isFoodAvailableBySchedule,
} from "utils/CustomFunctions";
import { today, tomorrow } from "utils/formatedDays";
import { cod_exceeds_message } from "utils/toasterMessages";
import useGetOfflinePaymentOptions from "../../../api-manage/hooks/react-query/offlinePayment/useGetOfflinePaymentOptions";
import useGetVehicleCharge from "../../../api-manage/hooks/react-query/order-place/useGetVehicleCharge";
import useGetStoreDetails from "../../../api-manage/hooks/react-query/store/useGetStoreDetails";
import useGetMostTrips from "../../../api-manage/hooks/react-query/useGetMostTrips";
import ItemSelectWithChip from "../../ItemSelectWithChip";
import CustomModal from "../../modal";
import { handleValuesFromCartItems } from "../../product-details/product-details-section/helperFunction";
import { CouponTitle } from "../CheckOut.style";
import DeliveryManTip from "../DeliveryManTip";
import SinglePrescriptionUpload from "../Prescription/SinglePrescriptionUpload";
import AddPaymentMethod from "./AddPaymentMethod";
import CheckoutStepper from "./CheckoutStepper";
import Cutlery from "./Cutlery";
import DeliveryDetails from "./DeliveryDetails";
import HaveCoupon from "./HaveCoupon";
import OrderCalculation from "./OrderCalculation";
import OrderSummaryDetails from "./OrderSummaryDetails";
import PartialPayment from "./PartialPayment";
import PartialPaymentModal from "./PartialPaymentModal";
import PlaceOrder from "./PlaceOrder";
import { INITIAL_STATE, scheduleReducer } from "./ScheduleReducer";
import { deliveryInstructions, productUnavailableData } from "./demoData";
import OfflineForm from "./offline-payment/OfflineForm";
import useGetCashBackAmount from "api-manage/hooks/react-query/cashback/useGetCashBackAmount";
import { ModuleTypes } from "helper-functions/moduleTypes";
import {
  setGuestUserInfo,
  setGuestUserOrderId,
} from "redux/slices/guestUserInfo";
import {
  setOrderDetailsModalOpen,
  setOrderInformation,
} from "redux/slices/utils";
import CustomImageContainer from "../../CustomImageContainer";
import thunderstorm from "../assets/thunderstorm.svg";
import { useFormik } from "formik";

import * as Yup from "yup";
import {useGetTax} from "api-manage/hooks/react-query/order-place/useGetTax";
export const deepEqual=(obj1, obj2)=> {
  if (obj1 === obj2) return true;

  if (
    typeof obj1 !== "object" ||
    obj1 === null ||
    typeof obj2 !== "object" ||
    obj2 === null
  ) {
    return false;
  }

  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);
  if (keys1.length !== keys2.length) return false;

  for (const key of keys1) {
    if (!keys2.includes(key) || !deepEqual(obj1[key], obj2[key])) {
      return false;
    }
  }

  return true;
}


const ItemCheckout = (props) => {
  const { configData, router, page, cartList, campaignItemList, totalAmount } =
    props;
  const theme = useTheme();
  const isSmall = useMediaQuery(theme.breakpoints.down("md"));
  const [enabled, setEnabled] = useState(cartList?.length ? true : false);
  const [check, setCheck] = React.useState(null);
  const [orderType, setOrderType] = useState("delivery");
  const [payableAmount, setPayableAmount] = useState(null);
  const [address, setAddress] = useState(undefined);
  const { couponInfo } = useSelector((state) => state.profileInfo);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [numberOfDay, setDayNumber] = useState(getDayNumber(today));
  const [offlinePayments, setOfflinePayments] = useState("");
  const [couponDiscount, setCouponDiscount] = useState(null);
  const [scheduleAt, setScheduleAt] = useState("now");
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [taxAmount, setTaxAmount] = useState(0);
  const [total_order_amount, setTotalOrderAmount] = useState(0);
  const [deliveryTip, setDeliveryTip] = useState(0);
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [isImageSelected, setIsImageSelected] = useState([]);
  const [cutlery, setCutlery] = useState(0);
  const [unavailable_item_note, setUnavailable_item_note] = useState(null);
  const [delivery_instruction, setDelivery_instruction] = useState(null);
  const [usePartialPayment, setUsePartialPayment] = useState(false);
  const [switchToWallet, setSwitchToWallet] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [openPartialModel, setOpenPartialModel] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [offlineCheck, setOfflineCheck] = useState(false);
  const [cashbackAmount, setCashbackAmount] = useState(null);
  const [isPackaging, setIsPackaging] = useState(false);
  const [packagingCharge, setPackagingCharge] = useState(0);
  const [paymentMethodImage, setPaymentMethodImage] = useState("");
  const [state, customDispatch] = useReducer(scheduleReducer, INITIAL_STATE);
  const { profileInfo } = useSelector((state) => state.profileInfo);
  const { guestUserInfo } = useSelector((state) => state.guestUserInfo);
  const { offlinePaymentInfo } = useSelector((state) => state.offlinePayment);

  const token = getToken();
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const guest_id = getGuestId();
  const { method } = router.query;
  const formik = useFormik({
    initialValues: {
      password: "",
      confirm_password: "",
    },
    validationSchema: Yup.object({
      password: Yup.string()
        .required(t("Password is required"))
        .min(6, t("Password is too short - should be 6 chars minimum.")),
      confirm_password: Yup.string()
        .required(t("Confirm Password"))
        .oneOf([Yup.ref("password"), null], t("Passwords must match")),
    }),
  });

  const currentModuleType = getCurrentModuleType();
  const storeId =
    page === "campaign"
      ? campaignItemList?.[0]?.store_id
      : cartList?.[0]?.store_id;
  const { data: storeData, refetch } = useGetStoreDetails(storeId);
  const { data: tripsData } = useGetMostTrips();
  const { mutate: offlineMutate, isLoading: offlinePaymentLoading } =
    useOfflinePayment();
  const {
    data: offlinePaymentOptions,
    refetch: refetchOfflinePaymentOptions,
    isLoading: offlineIsLoading,
  } = useGetOfflinePaymentOptions();
  const {mutate:taxMutate,data}=useGetTax()

  const passwordHandler = (value) => {
    formik.setFieldValue("password", value);
  };
  const confirmPasswordHandler = (value) => {
    formik.setFieldValue("confirm_password", value);
  };

  useEffect(() => {
    refetchOfflinePaymentOptions();
  }, []);
  useEffect(() => {

    if (storeId) {
      refetch();
    }
  }, [storeId]);

  const currentLatLng = JSON.parse(
    window.localStorage.getItem("currentLatLng")
  );
  const { data: zoneData } = useQuery(
    ["zoneId", location],
    async () => GoogleApi.getZoneId(currentLatLng),
    {
      retry: 1,
    }
  );

  const {
    data: distanceData,
    refetch: refetchDistance,
    isLoading,
  } = useQuery(
    ["get-distance", storeData, address],
    () => GoogleApi.distanceApi(storeData, address),
    {
      enabled: false,
      onError: onErrorResponse,
    }
  );
  const tempDistance = handleDistance(
    distanceData?.data,
    { latitude: storeData?.latitude, longitude: storeData?.longitude },
    address
  );

  const {
    data: extraCharge,
    isLoading: extraChargeLoading,
    refetch: extraChargeRefetch,
  } = useGetVehicleCharge({ tempDistance });
  useEffect(() => {
    if (distanceData) {
      extraChargeRefetch();
    }
  }, [distanceData]);
  const handleChange = (event) => {
    setDayNumber(event.target.value);
  };
  //order post api
  const { mutate: orderMutation, isLoading: orderLoading } = useMutation(
    "order-place",
    OrderApi.placeOrder
  );
  const userOnSuccessHandler = (res) => {};
  const { isLoading: customerLoading, data: customerData } = useQuery(
    ["profile-info"],
    ProfileApi.profileInfo,
    {
      onSuccess: userOnSuccessHandler,
      onError: onSingleErrorResponse,
    }
  );

  useEffect(() => {
    const currentLatLng = JSON.parse(localStorage.getItem("currentLatLng"));
    const location = localStorage.getItem("location");
    setAddress({
      ...currentLatLng,
      latitude: currentLatLng?.lat,
      longitude: currentLatLng?.lng,
      address: location,
      address_type: "Selected Address",
    });
    refetch();
  }, []);
  useEffect(() => {
    storeData && address && refetchDistance();
  }, [storeData, address?.lat, address?.lng]);

  useEffect(() => {
    const taxAmount = getTaxableTotalPrice(
      cartList,
      couponDiscount,
      storeData?.tax,
      storeData
    );
    setTaxAmount(taxAmount);
  }, [cartList, couponDiscount, storeData]);

  useEffect(() => {
    const total_order_amount = getFinalTotalPrice(
      cartList,
      couponDiscount,
      taxAmount,
      storeData
    );
    setTotalOrderAmount(total_order_amount);
  }, [cartList, couponDiscount, taxAmount]);

  const handleOffineOrder = () => {
    const offlinePaymentData = {
      ...offlinePaymentInfo,
      order_id: orderId,
      guest_id: guest_id,
    };
    dispatch(setOfflineInfoStep(3));
    dispatch(setOrderDetailsModal(true));
    offlineMutate(offlinePaymentData);
  };

  //orderId
  //offlinePaymentInfo
  useEffect(() => {
    if (offlineCheck) {
      handleOffineOrder();
    }
  }, [orderId]);

  const handleProductList = (productList, totalQty) => {
    return productList?.map((cart) => {
      return {
        add_on_ids:
          cart?.selectedAddons?.length > 0
            ? cart?.selectedAddons?.map((add) => {
                return add.id;
              })
            : [],
        add_on_qtys:
          cart?.selectedAddons?.length > 0
            ? cart?.selectedAddons?.map((add) => add.quantity)
            : [],
        add_ons:
          cart?.selectedAddons?.length > 0
            ? cart?.selectedAddons?.map((add) => {
                return {
                  id: add.id,
                  name: add.name,
                  price: add.price,
                };
              })
            : [],
        item_id: cart?.id,
        item_campaign_id: cart?.available_date_starts ? cart?.id : null,
        item_type: cart?.available_date_starts
          ? "AppModelsItemCampaign"
          : "AppModelsItem",
        price: cart?.price,
        quantity: cart?.quantity,
        variant:
          cart?.module_type === "food" ? getVariation(cart?.variation) : [],
        //new variation form needs to added here
        variation:
          cart?.module_type === "food"
            ? cart?.food_variations?.length > 0
              ? cart?.food_variations?.map((variation) => {
                  return {
                    name: variation.name,
                    values: {
                      label: handleValuesFromCartItems(variation.values),
                    },
                  };
                })
              : []
            : cart?.selectedOption?.length > 0
            ? cart?.selectedOption
            : [],
      };
    });
  };

  const handleOrderMutationObject = (carts, productList) => {
    const guestId = getToken() ? "" : guest_id;
    const isDigital =
      paymentMethod !== "cash_on_delivery" &&
      paymentMethod !== "wallet" &&
      paymentMethod !== "offline_payment" &&
      paymentMethod !== ""
        ? "digital_payment"
        : paymentMethod;

    const originData = {
      latitude: storeData?.latitude,
      longitude: storeData?.longitude,
    };
    if (getCurrentModuleType() === "pharmacy") {
      const formData = new FormData();
      formData.append("cart", JSON.stringify(carts));
      if (scheduleAt !== "now") {
        formData.append("schedule_at", scheduleAt);
      }

      formData.append("payment_method", isDigital);
      formData.append("order_type", orderType);

      formData.append("store_id", storeData?.id);
      if (couponDiscount?.code) {
        formData.append("coupon_code", couponDiscount?.code);
      }

      formData.append("coupon_discount_amount", couponDiscount?.discount);
      formData.append("coupon_discount_title", couponDiscount?.title);

      formData.append("discount_amount", getProductDiscount(productList));
      formData.append(
        "distance",
        handleDistance(
          distanceData?.data,
          originData,
          address
        )
      );
      formData.append("order_amount", totalAmount);
      formData.append("dm_tips", deliveryTip);

      formData.append("address", address?.address);
      formData.append("address_type", address?.address_type);
      formData.append("lat", address?.lat);
      formData.append("latitude", address?.latitude);
      formData.append("lng", address?.lng);
      formData.append("longitude", address?.longitude);
      formData.append("guest_id", guestId);
      formData.append(
        "is_buy_now",
        page === "buy_now" || page === "campaign" ? 1 : 0
      );
      formData.append("house", token ? address?.house : guestUserInfo?.house);
      formData.append("floor", token ? address?.floor : guestUserInfo?.floor);
      formData.append("road", token ? address?.road : guestUserInfo?.road);
      formData.append(
        "contact_person_name",
        guestUserInfo?.contact_person_name
      );
      formData.append(
        "contact_person_number",
        token
          ? address?.contact_person_number
            ? address?.contact_person_number
            : profileInfo?.phone
          : `+${guestUserInfo?.contact_person_number}`
      );
      formData.append(
        "contact_person_email",
        guestUserInfo?.contact_person_email
      );
      if (isImageSelected?.length > 0) {
        isImageSelected?.forEach((item) =>
          formData.append("order_attachment", item)
        );
      }
      formData.append(
        "extra_packaging_amount",
        packagingCharge > 0 ? packagingCharge : 0
      );
      formData.append("create_new_user", check ? 1 : 0);
      formData.append("is_guest", token ? 0 : 1);
      formData.append("password", formik.values.password);
      return formData;
    } else {
      return {
        cart: JSON.stringify(carts),
        ...address,
        is_buy_now: page === "buy_now" || page === "campaign" ? 1 : 0,
        partial_payment: usePartialPayment,
        schedule_at: scheduleAt === "now" ? null : scheduleAt,
        // order_time: scheduleAt,
        payment_method: isDigital,
        order_type: orderType === "schedule_order" ? "delivery" : orderType,
        store_id: storeData?.id,
        coupon_code: couponDiscount?.code,
        coupon_discount_amount: couponDiscount?.discount,
        coupon_discount_title: couponDiscount?.title,
        discount_amount: getProductDiscount(productList),
        distance: handleDistance(
          distanceData?.data,
          originData,
          address
        ),
        order_amount: totalAmount,
        dm_tips: deliveryTip,
        cutlery: cutlery,
        unavailable_item_note: unavailable_item_note,
        delivery_instruction: delivery_instruction,
        guest_id: guestId,
        contact_person_name: token
          ? address?.contact_person_name
            ? address?.contact_person_name
            : profileInfo?.name
          : guestUserInfo?.contact_person_name,
        contact_person_number: formatPhoneNumber(
          token
            ? address?.contact_person_number
              ? address?.contact_person_number
              : profileInfo?.phone
            : `${guestUserInfo?.contact_person_number}`
        ),
        contact_person_email: guestUserInfo?.contact_person_email,
        house: token ? address?.house : guestUserInfo?.house,
        floor: token ? address?.floor : guestUserInfo?.floor,
        road: token ? address?.road : guestUserInfo?.road,
        extra_packaging_amount: packagingCharge > 0 ? packagingCharge : 0,
        create_new_user: check ? 1 : 0,
        password: formik.values.password,
        is_guest: token ? 0 : 1,
      };
    }
  };


  const prevCartRef = useRef(null);
  const prevCouponRef = useRef(null);

  useEffect(() => {
    if (!cartList || !storeData) return;

    const cartChanged = !deepEqual(prevCartRef.current, cartList);
    const couponChanged = !deepEqual(prevCouponRef.current, couponDiscount);

    if (cartChanged || couponChanged) {
      prevCartRef.current = cartList;
      prevCouponRef.current = couponDiscount;

      const productList = page === "campaign" ? campaignItemList : cartList;
      const totalQty = 0;
      const carts = handleProductList(productList, totalQty);
      const orderObject = handleOrderMutationObject(carts, productList);

      taxMutate(orderObject, {
        onError: onErrorResponse,
      });
    }
  }, [cartList, campaignItemList, couponDiscount, storeData]);

  const handlePlaceOrder = () => {
    const itemsList = page === "campaign" ? campaignItemList : cartList;
    const isAvailable =
      storeData?.schedule_order && getCurrentModuleType() === ModuleTypes.FOOD
        ? isFoodAvailableBySchedule(itemsList, scheduleAt)
        : true;
    if (isAvailable) {
      const walletAmount = customerData?.data?.wallet_balance;
      let productList = page === "campaign" ? campaignItemList : cartList;
      if (paymentMethod === "wallet") {
        if (Number(walletAmount) < Number(totalAmount)) {
          toast.error(t("Wallet balance is below total amount."), {
            id: "wallet",
            position: "bottom-right",
          });
        } else {
          let totalQty = 0;
          let carts = handleProductList(productList, totalQty);
          const handleSuccessSecond = (response) => {
            if (response?.data) {
              if (token) {
                dispatch(setOrderDetailsModal(true));
              }
              if (paymentMethod === "digital_payment") {
                toast.success(response?.data?.message);
                const newBaseUrl = baseUrl;
                const page = "my-orders";
                const callBackUrl = token
                  ? `${window.location.origin}/profile?page=${page}`
                  : `${window.location.origin}/order?order_id=${response?.data?.order_id}&total=${response?.data?.total_ammount}`;
                const url = `${newBaseUrl}/payment-mobile?order_id=${
                  response?.data?.order_id
                }&customer_id=${
                  customerData?.data?.id ?? guest_id
                }&callback=${callBackUrl},`;
                localStorage.setItem("totalAmount", totalAmount);
                dispatch(setClearCart());
                Router.push(url);
              } else if (paymentMethod === "wallet") {
                toast.success(response?.data?.message);
                setOrderId(response?.data?.order_id);
                setOrderSuccess(true);
              } else {
                if (response.status === 203) {
                  toast.error(response.data.errors[0].message);
                }
                //setOrderSuccess(true)
              }
            }
          };
          if (carts?.length > 0) {
            let order = handleOrderMutationObject(carts, productList);
            orderMutation(order, {
              onSuccess: handleSuccessSecond,
              onError: (error) => {
                error?.response?.data?.errors?.forEach((item) =>
                  toast.error(item.message, {
                    position: "bottom-right",
                  })
                );
              },
            });
          }
        }
      } else {
        let totalQty = 0;
        let carts = handleProductList(productList, totalQty);
        const handleSuccess = (response) => {
          if (response?.data) {
            if (token) {
              dispatch(setOrderDetailsModal(true));
            } else {
              dispatch(setGuestUserOrderId(response?.data?.order_id));
              dispatch(setOrderInformation(response?.data));
              dispatch(setOrderDetailsModalOpen(true));
              dispatch(setGuestUserInfo(null));
            }
            if (
              paymentMethod === "cash_on_delivery" ||
              paymentMethod === "offline_payment" ||
              paymentMethod === "wallet"
            ) {
              toast.success(response?.data?.message, {
                id: paymentMethod,
              });
            }
            if (
              paymentMethod !== "cash_on_delivery" &&
              paymentMethod !== "offline_payment"
            ) {
              const payment_platform = "web";
              const page = "my-orders";
              const callBackUrl = token
                ? `${window.location.origin}/profile?page=${page}`
                : `${window.location.origin}/home`;
              const url = `${baseUrl}/payment-mobile?order_id=${
                response?.data?.order_id
              }&customer_id=${
                customerData?.data?.id ?? response?.data?.user_id
                  ? response?.data?.user_id
                  : guest_id
              }&payment_platform=${payment_platform}&callback=${callBackUrl}&payment_method=${paymentMethod}`;
              localStorage.setItem("totalAmount", totalAmount);
              dispatch(setGuestUserInfo(null));
              //dispatch(setClearCart());
              Router.push(url, undefined, { shallow: true });
            } else if (paymentMethod === "offline_payment") {
              setOrderId(response?.data?.order_id);
              dispatch(setOrderInformation(response?.data));
              setOrderSuccess(true);
              setOfflineCheck(true);
            } else {
              setOrderId(response?.data?.order_id);
              dispatch(setOrderInformation(response?.data));
              setOrderSuccess(true);
            }
          }
        };
        if (carts?.length > 0) {
          let order = handleOrderMutationObject(carts, productList);
          orderMutation(order, {
            onSuccess: handleSuccess,
            onError: (error) => {
              error?.response?.data?.errors?.forEach((item) =>
                toast.error(item.message, {
                  position: "bottom-right",
                })
              );
            },
          });
        }
      }
    } else {
      toast.error(
        t(
          "One or more item is not available for the chosen preferable schedule time."
        )
      );
    }
  };

  const isStoreOpen = () => {
    // storeData?.schedule_order
  };
  const storeCloseToast = () =>
    toast.error(
      t(`${getStoresOrRestaurants().slice(0, -1)} is closed. Try again later.`)
    );
  //totalAmount
  const handlePlaceOrderBasedOnAvailability = () => {
    //cod -> cash on delivery
    const codLimit =
      getInfoFromZoneData(zoneData)?.pivot?.maximum_cod_order_amount;
    if (orderType === "take_away") {
      handlePlaceOrder();
    } else {
      if (codLimit) {
        if (totalAmount <= codLimit) {
          handlePlaceOrder();
        } else {
          toast.error(t(cod_exceeds_message), {
            duration: 5000,
          });
        }
      } else {
        handlePlaceOrder();
      }
    }
  };

  const isSchedules = () => {
    if (storeData?.schedules.length > 0) {
      const todayInNumber = moment().weekday();
      let isOpen = false;
      let filteredSchedules = storeData?.schedules.filter(
        (item) => item.day === todayInNumber
      );
      let isAvailableNow = [];

      filteredSchedules.forEach((item) => {
        if (isAvailable(item?.opening_time, item?.closing_time)) {
          isAvailableNow.push(item);
        }
      });

      if (isAvailableNow.length > 0) {
        isOpen = true;
      } else {
        isOpen = false;
      }

      return isOpen; // Add this line to return true or false based on whether the store is open.
    }
  };
  const placeOrder = () => {
    if (storeData?.active) {
      //checking restaurant or shop open or not
      if (isSchedules()) {
        handlePlaceOrderBasedOnAvailability();
      } else {
        storeCloseToast();
      }
    } else {
      storeCloseToast();
    }
  };

  const couponRemove = () => {};
  useEffect(() => {
    if (orderSuccess) {
      handleOrderSuccess();
    }
  }, [orderSuccess]);
  const handleOrderSuccess = () => {
    if (page === "buysetScheduleAt_now") {
      dispatch(setRemoveItemFromCart(cartList?.[0]));
    }
    localStorage.setItem("totalAmount", totalAmount);
    if (!token) {
      Router.push("/home");
    } else {
      Router.push(
        {
          pathname: "/profile",
          query: {
            orderId: orderId,
            page: "my-orders",
            from: "checkout",
          },
        },
        undefined,
        { shallow: false }
      );
    }
  };
  const handleImageUpload = (value) => {
    setIsImageSelected([value]);
  };
  const handlePartialPayment = () => {
    if (payableAmount > customerData?.data?.wallet_balance) {
      setUsePartialPayment(true);
      setPaymentMethod("");
      dispatch(setOfflineMethod(""));
    } else {
      setPaymentMethod("wallet");
      setSwitchToWallet(true);
      dispatch(setOfflineMethod(""));
    }
  };
  const removePartialPayment = () => {
    if (payableAmount > customerData?.data?.wallet_balance) {
      setUsePartialPayment(false);
      setPaymentMethod("");
      dispatch(setOfflineMethod(""));
    } else {
      setPaymentMethod("");
      setSwitchToWallet(false);
      dispatch(setOfflineMethod(""));
    }
  };
  const handlePartialPaymentCheck = () => {
    if (configData?.partial_payment_status === 1) {
      if (couponDiscount && usePartialPayment) {
        if (
          payableAmount > customerData?.data?.wallet_balance &&
          !usePartialPayment
        ) {
          setOpenPartialModel(true);
        } else {
          if (
            usePartialPayment &&
            customerData?.data?.wallet_balance > payableAmount
          ) {
            setOpenModal(true);
          }
        }
      } else if ((deliveryTip > 0 && usePartialPayment) || switchToWallet) {
        if (payableAmount > customerData?.data?.wallet_balance) {
          setOpenPartialModel(true);
        } else {
          if (
            usePartialPayment &&
            customerData?.data?.wallet_balance > payableAmount
          ) {
            setOpenModal(true);
          }
        }
      } else if (orderType && usePartialPayment) {
        if (
          payableAmount > customerData?.data?.wallet_balance &&
          !usePartialPayment
        ) {
          setOpenPartialModel(true);
        } else {
          if (
            usePartialPayment &&
            customerData?.data?.wallet_balance > payableAmount
          ) {
            setOpenModal(true);
          }
          //setOpenModal(true);
        }
      }
    }
  };
  const handleCashbackAmount = (data) => {
    setCashbackAmount(data);
  };
  const { refetch: refetchCashbackAmount } = useGetCashBackAmount({
    amount: payableAmount,
    handleSuccess: handleCashbackAmount,
  });
  useEffect(() => {
    handlePartialPaymentCheck();
    if (payableAmount > 0) {
      refetchCashbackAmount();
    }
  }, [payableAmount]);

  const agreeToPartial = () => {
    setPaymentMethod("");
    setUsePartialPayment(true);
    setOpenPartialModel(false);
    setSwitchToWallet(false);
  };
  const notAgreeToPartial = () => {
    setUsePartialPayment(false);
    setOpenPartialModel(false);
    setSwitchToWallet(false);
  };
  const agreeToWallet = () => {
    setPaymentMethod("wallet");
    setSwitchToWallet(true);
    setUsePartialPayment(false);
    setOpenModal(false);
  };
  const notAgreeToWallet = () => {
    setPaymentMethod("");
    setSwitchToWallet(false);
    setUsePartialPayment(false);
    setOpenModal(false);
  };
  const handleCutlery = (status) => {
    if (status) {
      setCutlery(1);
    } else {
      setCutlery(1);
    }
  };
  const handleItemUnavailableNote = (value) => {
    setUnavailable_item_note(value);
  };
  const handleDeliveryInstructionNote = (value) => {
    setDelivery_instruction(value);
  };
  useEffect(() => {
    if (paymentMethod !== "wallet") {
      setSwitchToWallet(false);
    }
  }, [paymentMethod]);
  const handleBadWeatherUi = (zoneWiseData) => {
    const currentZoneInfo = zoneWiseData?.find(
      (item) => item.id === storeData?.zone_id
    );

    if (currentZoneInfo) {
      if (currentZoneInfo?.increased_delivery_fee_status === 1) {
        return (
          <>
            {currentZoneInfo?.increase_delivery_charge_message && (
              <CustomStackFullWidth
                alignItems="center"
                justifyContent="flex-start"
                gap="10px"
                direction="row"
                mt="10px"
                sx={{
                  backgroundColor: (theme) =>
                    alpha(theme.palette.primary.main, 0.3),
                  borderRadius: "4px",
                  padding: "5px 10px",
                }}
              >
                <CustomImageContainer
                  height="40px"
                  width="40px"
                  src={thunderstorm.src}
                  objectFit="contained"
                />

                <Typography>
                  {currentZoneInfo?.increase_delivery_charge_message}
                </Typography>
              </CustomStackFullWidth>
            )}
          </>
        );
      }
    }
  };
  const handleExtraPackaging = (e) => {
    setIsPackaging(e.target.checked);
  };

  useEffect(() => {
    if (isPackaging) {
      setPackagingCharge(storeData?.extra_packaging_amount);
    } else {
      setPackagingCharge(0);
    }
  }, [isPackaging]);
  const isZoneDigital = getDigitalMethodFromZone(
    storeData?.zone_id,
    zoneData?.data
  );

  const isZoneCod = () => {};
  const hasOnlyPaymentMethod = () => {
    if (
      !configData?.cash_on_delivery &&
      configData?.customer_wallet_status !== 1 &&
      configData?.offline_payment_status !== 1 &&
      configData?.digital_payment &&
      configData?.active_payment_method_list?.length === 1 &&
      isZoneDigital?.digital_payment
    ) {
      setPaymentMethod(configData?.active_payment_method_list[0]?.gateway);
      setPaymentMethodImage(
        configData?.active_payment_method_list[0]?.gateway_image_full_url
      );
    }
  };

  useEffect(() => {
    hasOnlyPaymentMethod();
  }, [configData, isZoneDigital]);

  return (
    <>
      {method === "offline" ? (
        <Grid container mb="2rem" paddingTop={{ xs: "1.5rem", md: "2.5rem" }}>
          <Grid item xs={12} md={12}>
            <CheckoutStepper />
            <CustomStackFullWidth
              marginTop={{ xs: "1.5rem", md: "2.5rem" }}
              alignItems="center"
            >
              <CustomPaperBigCard
                sx={{
                  width: { xs: "100%", sm: "90%", md: "80%" },
                }}
              >
                <OfflineForm
                  offlinePaymentOptions={offlinePaymentOptions}
                  total_order_amount={payableAmount}
                  placeOrder={placeOrder}
                  offlinePaymentLoading={offlinePaymentLoading || orderLoading}
                  usePartialPayment={usePartialPayment}
                />
              </CustomPaperBigCard>
            </CustomStackFullWidth>
          </Grid>
        </Grid>
      ) : (
        <Grid
          container
          spacing={3}
          mb="2rem"
          paddingTop={{ xs: "1.5rem", md: "2.5rem" }}
        >
          <Grid item xs={12} md={7}>
            <Stack
              spacing={{ xs: 2, sm: 2, md: 3 }}
              pb={{ xs: "1rem", sm: "2rem", md: "4rem" }}
            >
              <CheckoutStepper />
              {zoneData && (
                <AddPaymentMethod
                  setPaymentMethod={setPaymentMethod}
                  paymentMethod={paymentMethod}
                  zoneData={zoneData}
                  configData={configData}
                  orderType={orderType}
                  usePartialPayment={usePartialPayment}
                  offlinePaymentOptions={offlinePaymentOptions}
                  setSwitchToWallet={setSwitchToWallet}
                  isZoneDigital={isZoneDigital}
                  setPaymentMethodImage={setPaymentMethodImage}
                  paymentMethodImage={paymentMethodImage}
                  remainingBalance={
                    customerData?.data?.wallet_balance - payableAmount
                  }
                  handlePartialPayment={handlePartialPayment}
                  walletBalance={customerData?.data?.wallet_balance}
                  removePartialPayment={removePartialPayment}
                  switchToWallet={switchToWallet}
                  customerData={customerData}
                  payableAmount={payableAmount}
                />
              )}

              <DeliveryDetails
                storeData={storeData}
                setOrderType={setOrderType}
                orderType={orderType}
                setAddress={setAddress}
                address={address}
                customDispatch={customDispatch}
                scheduleTime={state.scheduleTime}
                setDayNumber={setDayNumber}
                setDeliveryTip={setDeliveryTip}
                handleChange={handleChange}
                today={today}
                tomorrow={tomorrow}
                numberOfDay={numberOfDay}
                configData={configData}
                setScheduleAt={setScheduleAt}
                formik={formik}
                passwordHandler={passwordHandler}
                confirmPasswordHandler={confirmPasswordHandler}
                check={check}
                setCheck={setCheck}
                isHomeDelivery={configData?.home_delivery_status}
              />

              {Number.parseInt(configData?.dm_tips_status) === 1 &&
                orderType !== "take_away" && (
                  <DeliveryManTip
                    orderType={orderType}
                    deliveryTip={deliveryTip}
                    setDeliveryTip={setDeliveryTip}
                    isSmall={isSmall}
                    tripsData={tripsData}
                    setUsePartialPayment={setUsePartialPayment}
                  />
                )}

              <Grid item md={12} xs={12}></Grid>
            </Stack>
          </Grid>
          <Grid item xs={12} md={5} height="auto">
            <CustomStackFullWidth>
              {currentModuleType === "pharmacy" && (
                <CustomPaperBigCard
                  sx={{ marginBottom: "1rem" }}
                  padding={isSmall ? "0px" : "1.25rem"}
                  noboxshadow={isSmall && "true"}
                  backgroundcolor={isSmall && theme.palette.background.default}
                >
                  <SinglePrescriptionUpload
                    t={t}
                    handleImageUpload={handleImageUpload}
                    borderRadius="10px"
                  />
                </CustomPaperBigCard>
              )}
              <CustomPaperBigCard
                height="auto"
                padding={isSmall ? "0px" : "1.25rem"}
                noboxshadow={isSmall && "true"}
                backgroundcolor={isSmall && theme.palette.background.default}
              >
                <Stack justifyContent="space-between">
                  <CouponTitle textAlign="left">
                    {t("Order Summary")}
                  </CouponTitle>
                  {zoneData && handleBadWeatherUi(zoneData?.data?.zone_data)}
                  <SimpleBar
                    style={{
                      maxHeight: "500px",
                      width: "100%",
                    }}
                  >
                    <OrderSummaryDetails
                      page={page}
                      configData={configData}
                      cartList={cartList}
                      t={t}
                      campaignItemList={campaignItemList}
                      isSmall={isSmall}
                    />
                  </SimpleBar>
                  {storeData && token && (
                    <HaveCoupon
                      store_id={storeData?.id}
                      setCouponDiscount={setCouponDiscount}
                      counponRemove={couponRemove}
                      couponDiscount={couponDiscount}
                      totalAmount={totalAmount}
                      deliveryFee={deliveryFee}
                      deliveryTip={deliveryTip}
                      setSwitchToWallet={setSwitchToWallet}
                      walletBalance={customerData?.data?.wallet_balance}
                      payableAmount={payableAmount}
                    />
                  )}
                  {/*{configData?.customer_wallet_status === 1 &&*/}
                  {/*  customerData?.data?.wallet_balance > 0 &&*/}
                  {/*  configData?.partial_payment_status === 1 && (*/}
                  {/*    <Grid item md={12} xs={12}>*/}
                  {/*      <PartialPayment*/}
                  {/*        remainingBalance={*/}
                  {/*          customerData?.data?.wallet_balance - payableAmount*/}
                  {/*        }*/}
                  {/*        handlePartialPayment={handlePartialPayment}*/}
                  {/*        usePartialPayment={usePartialPayment}*/}
                  {/*        walletBalance={customerData?.data?.wallet_balance}*/}
                  {/*        paymentMethod={paymentMethod}*/}
                  {/*        switchToWallet={switchToWallet}*/}
                  {/*        removePartialPayment={removePartialPayment}*/}
                  {/*        payableAmount={payableAmount}*/}
                  {/*      />*/}
                  {/*    </Grid>*/}
                  {/*  )}*/}
                  {getCurrentModuleType() === "food" && storeData?.cutlery && (
                    <Cutlery isChecked={cutlery} handleChange={handleCutlery} />
                  )}
                  <ItemSelectWithChip
                    title="If Any Product is not available"
                    data={productUnavailableData}
                    handleChange={handleItemUnavailableNote}
                  />
                  <ItemSelectWithChip
                    title="Add More Delivery Instruction"
                    data={deliveryInstructions}
                    handleChange={handleDeliveryInstructionNote}
                  />
                  <OrderCalculation
                    usePartialPayment={usePartialPayment}
                    cartList={page === "campaign" ? campaignItemList : cartList}
                    storeData={storeData}
                    couponDiscount={couponDiscount}
                    taxAmount={data}
                    distanceData={distanceData}
                    total_order_amount={total_order_amount}
                    configData={configData}
                    couponInfo={couponInfo}
                    orderType={orderType}
                    deliveryTip={deliveryTip}
                    origin={{
                      latitude: storeData?.latitude,
                      longitude: storeData?.longitude,
                    }}
                    destination={address}
                    zoneData={zoneData}
                    extraCharge={extraCharge && extraCharge}
                    setDeliveryFee={setDeliveryFee}
                    extraChargeLoading={extraChargeLoading}
                    walletBalance={customerData?.data?.wallet_balance}
                    setPayableAmount={setPayableAmount}
                    additionalCharge={
                      configData?.additional_charge_status === 1 &&
                      configData?.additional_charge
                    }
                    payableAmount={payableAmount}
                    cashbackAmount={cashbackAmount}
                    handleExtraPackaging={handleExtraPackaging}
                    isPackaging={isPackaging}
                    packagingCharge={packagingCharge}
                    customerData={customerData}
                    initVauleEx={storeData?.extra_packaging_amount}
                    isLoading={isLoading}
                  />

                  <PlaceOrder
                    placeOrder={placeOrder}
                    orderLoading={orderLoading}
                    zoneData={zoneData}
                    storeData={storeData}
                    isSchedules={isSchedules}
                    storeCloseToast={storeCloseToast}
                    page={page}
                    isLoading={isLoading}
                  />
                </Stack>
              </CustomPaperBigCard>
            </CustomStackFullWidth>
          </Grid>
          {openModal && (
            <CustomModal
              openModal={openModal}
              //handleClose={() => setOpenModal(false)}
            >
              <PartialPaymentModal
                payableAmount={payableAmount}
                agree={agreeToWallet}
                reject={notAgreeToWallet}
                colorTitle=" Want to pay via your wallet ? "
                title="You can pay the full amount with your wallet."
                remainingBalance={
                  customerData?.data?.wallet_balance - payableAmount
                }
              />
            </CustomModal>
          )}
          {openPartialModel && (
            <CustomModal
              openModal={openPartialModel}
              //handleClose={() => setOpenPartialModel(false)}
            >
              <PartialPaymentModal
                payableAmount={payableAmount}
                agree={agreeToPartial}
                reject={notAgreeToPartial}
                colorTitle=" Want to pay partially with wallet ? "
                title="You do not have sufficient balance to pay full amount via wallet."
              />
            </CustomModal>
          )}
        </Grid>
      )}
    </>
  );
};

ItemCheckout.propTypes = {};

export default ItemCheckout;
