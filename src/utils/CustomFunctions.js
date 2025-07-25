import moment from "moment";
import { currentDate, nextday, today } from "./formatedDays";
import { t } from "i18next";
import {
  getCurrentModuleId,
  getCurrentModuleType,
} from "helper-functions/getCurrentModuleType";
import { store } from "redux/store";
import { getDiscountedAmount } from "helper-functions/CardHelpers";

export const getNumberWithConvertedDecimalPoint = (
  amount,
  digitAfterDecimalPoint
) => {
  if (amount === 0) {
    return amount;
  } else {
    return ((amount * 100) / 100).toFixed(
      Number.parseInt(digitAfterDecimalPoint)
    );
  }
};

export const isAvailable = (start, end) => {
  const startTime = moment(start, "HH:mm:ss");
  const endTime = moment(end, "HH:mm:ss");
  let currentTime = moment();
  return moment(currentTime).isBetween(startTime, endTime);
};

export const handleTotalAmountWithAddons = (
  mainTotalAmount,
  selectedAddOns
) => {
  if (selectedAddOns?.length > 0) {
    let selectedAddonsTotalPrice = 0;
    selectedAddOns?.forEach(
      (item) => (selectedAddonsTotalPrice += item?.price * item?.quantity)
    );
    return mainTotalAmount + selectedAddonsTotalPrice;
  } else {
    return mainTotalAmount;
  }
};

export const getDateFormat = (date) => {
  return moment(date).format("LL");
};

export const getDateFormatAnotherWay = (date) => {
  return moment(date).format("ll");
};

export const getIndexFromArrayByComparision = (arrayOfObjects, object) => {
  return arrayOfObjects.findIndex(
    (item) =>
      JSON.stringify(item.food_variations) === JSON.stringify(object.food_variations) &&
      item.id === object.id
  );
};

export const calculateItemBasePrice = (item, selectedOptions) => {
  let basePrice = item?.price;
  if (selectedOptions.length > 0) {
    selectedOptions?.forEach((option) => {
      if (option.isSelected === true) {
        basePrice += Number.parseInt(option?.optionPrice);
      }
    });
  }
  return basePrice;
  // if(item)
};

export const FormatedDateWithTime = (date) => {
  let dateString = moment(date).format("YYYY-MM-DD hh:mm a");
  return dateString;
};

export const onlyTimeFormat = (date) => {
  let timeString = moment(date, "YYYY-MM-DD hh:mm a").format("hh:mm");
  return timeString;
};

export const getDayNumber = (day) => {
  switch (day) {
    case "Sunday": {
      return 0;
    }
    case "Monday": {
      return 1;
    }
    case "Tuesday": {
      return 2;
    }
    case "Wednesday": {
      return 3;
    }
    case "Thursday": {
      return 4;
    }
    case "Friday": {
      return 5;
    }
    case "Saturday": {
      return 6;
    }
  }
};

const handleVariationValuesSum = (productVariations) => {
  let sum = 0;
  if (productVariations.length > 0) {
    productVariations?.forEach((pVal) => {
      pVal?.values?.forEach((cVal) => {
        if (cVal?.isSelected) {
          sum += Number.parseInt(cVal?.optionPrice);
        }
      });
    });
  }
  return sum;
};

const handleValuesSum = (productVariations) => {
  let sum = 0;
  if (productVariations.length > 0) {
    productVariations?.forEach((pVal) => (sum += Number.parseInt(pVal.price)));
  }
  return sum;
};

export const handleProductValueWithOutDiscount = (product) => {
  let productPrice = product?.price;
  if (getCurrentModuleType() === "food") {
    if (product?.food_variations?.length > 0) {
      productPrice += handleVariationValuesSum(product?.food_variations);
      return productPrice;
    } else {
      return productPrice;
    }
  } else {
    if (
      product?.variations?.length > 0 &&
      product?.selectedOption?.length > 0
    ) {
      if (product?.selectedOption?.length > 0) {
        productPrice = product?.selectedOption?.[0]?.price;
        return productPrice;
      }
    } else {
      productPrice = product.price;
      return productPrice;
    }
  }
};

export const selectedAddonsTotal = (addOns) => {
  if (addOns?.length > 0) {
    let vv = addOns?.reduce(
      (total, addOn) => addOn.price * addOn.quantity + total,
      0
    );

    return vv;
  } else {
    return 0;
  }
};

const handleValueWithOutDiscount = (product) => {
  let productPrice = product.price;
  if (product.selectedOption.length > 0) {
    productPrice = handleValuesSum(product.selectedOption);
    return productPrice;
  } else {
    return productPrice;
  }
};

export const handlePurchasedAmount = (cartList) => {
  if (getCurrentModuleType() === "food") {
    return cartList.reduce(
      (total, product) =>
        (product.food_variations.length > 0
          ? handleProductValueWithOutDiscount(product)
          : product.price) *
          product.quantity +
        selectedAddonsTotal(product.selectedAddons) +
        total,
      0
    );
  } else {
    return cartList.reduce(
      (total, product) =>
        (product?.selectedOption?.length > 0
          ? handleValueWithOutDiscount(product)
          : product.price) *
          product.quantity +
        total,
      0
    );
  }
};

export const getCouponDiscount = (couponDiscount, storeData, cartList) => {
  if (couponDiscount) {
    let purchasedAmount = handlePurchasedAmount(cartList);
    if (purchasedAmount >= couponDiscount.min_purchase) {
      switch (couponDiscount.coupon_type) {
        case "zone_wise":
          let zoneId = JSON.parse(localStorage.getItem("zoneid"));
          if (
            Number.parseInt(zoneId[0]) ===
            Number.parseInt(couponDiscount.zoneId[0])
          ) {
            if (couponDiscount && couponDiscount.discount_type === "amount") {
              if (couponDiscount.max_discount === 0) {
                return couponDiscount.discount;
              } else {
                return couponDiscount.discount;
              }
            } else {
              let percentageWiseDis =
                (purchasedAmount - getProductDiscount(cartList, storeData)) *
                (couponDiscount.discount / 100);
              if (couponDiscount.max_discount === 0) {
                return percentageWiseDis;
              } else {
                if (percentageWiseDis >= couponDiscount.max_discount) {
                  return couponDiscount.max_discount;
                } else {
                  return percentageWiseDis;
                }
              }
            }
          } else {
            return 0;
          }
          break;
        case "store_wise":
          let storeId = JSON.parse(couponDiscount.data);
          if (Number.parseInt(storeId[0]) === storeData?.id) {
            if (couponDiscount && couponDiscount.discount_type === "amount") {
              if (couponDiscount.max_discount === 0) {
                return couponDiscount.discount;
              } else {
              }
            } else {
              let percentageWiseDis =
                (purchasedAmount - getProductDiscount(cartList, storeData)) *
                (couponDiscount.discount / 100);
              if (couponDiscount.max_discount === 0) {
                return percentageWiseDis;
              } else {
                if (percentageWiseDis >= couponDiscount.max_discount) {
                  return couponDiscount.max_discount;
                } else {
                  return percentageWiseDis;
                }
              }
            }
          } else {
            return 0;
          }
          break;
        case "free_delivery":
          return 0;
        case "default":
          if (couponDiscount && couponDiscount.discount_type === "amount") {
            if (couponDiscount.max_discount === 0) {
              return couponDiscount.discount;
            } else {
              return couponDiscount.discount;
            }
          } else if ("percent") {
            let percentageWiseDis =
              (purchasedAmount - getProductDiscount(cartList, storeData)) *
              (couponDiscount.discount / 100);
            if (couponDiscount.max_discount === 0) {
              return percentageWiseDis;
            } else {
              if (percentageWiseDis >= couponDiscount.max_discount) {
                return couponDiscount.max_discount;
              } else {
                return percentageWiseDis;
              }
            }
          }
      }
    } else {
      return 0;
    }
  }
};

export const getTaxableTotalPrice = (
  items,
  couponDiscount,
  storeData,
  referDiscount
) => {
  let tax = storeData?.tax || 0;
  let total =
    handlePurchasedAmount(items) -
    getProductDiscount(items, storeData) -
    (couponDiscount ? getCouponDiscount(couponDiscount, storeData, items) : 0) -
    (referDiscount ? referDiscount : 0);

  if (store?.getState?.()?.configData?.configData?.tax_included === 1) {
    return (total * tax) / (100 + tax);
  } else {
    return (total * tax) / 100;
  }
};

const handleTotalDiscountBasedOnModules = (
  items,
  restaurentDiscount,
  resDisType
) => {
  if (getCurrentModuleType() === "food") {
    return items.reduce(
      (total, product) =>
        (product.food_variations.length > 0
          ? handleProductValueWithOutDiscount(product) -
            getConvertDiscount(
              restaurentDiscount,
              resDisType,
              handleProductValueWithOutDiscount(product),
              product.store_discount
            )
          : product.price -
            getConvertDiscount(
              restaurentDiscount,
              resDisType,
              product.price,
              product.store_discount,
              product.flash_sale
            )) *
          product.quantity +
        total,
      0
    );
  } else {
    return items.reduce(
      (total, product) =>
        (product?.selectedOption?.length > 0
          ? handleValueWithOutDiscount(product) -
            getConvertDiscount(
              restaurentDiscount,
              resDisType,
              handleValueWithOutDiscount(product),
              product.store_discount
            )
          : product.price -
            getConvertDiscount(
              restaurentDiscount,
              resDisType,
              product.price,
              product.store_discount
            )) *
          product.quantity +
        total,
      0
    );
  }
};

const handleProductWiseDiscount = (items) => {
  let totalDiscount = 0;
  items?.forEach((item) => {
    if (item.discount > 0) {
      if (item.discount_type === "amount") {
        totalDiscount += item?.discount * item.quantity;
      } else {
        let a =
          handleProductValueWithOutDiscount(item) -
          getConvertDiscountNew(
            item.discount,
            item.discount_type,
            handleProductValueWithOutDiscount(item),
            item.store_discount
          );
        totalDiscount += a * item.quantity;
      }
    } else {
      totalDiscount += item.discount;
    }
  });
  return totalDiscount;
};

export const getProductDiscount = (items, storeData,diffDiscount) => {
  const productWiseDiscount = handleProductWiseDiscount(items);
  if (storeData?.discount) {
    const endDate = storeData?.discount?.end_date;
    const endTime = storeData?.discount?.end_time;
    const combinedEndDateTime = moment(
      `${endDate} ${endTime}`,
      "YYYY-MM-DD HH:mm:ss"
    );
    const currentDateTime = moment();

    // Check if the store discount is still valid
    if (combinedEndDateTime.isAfter(currentDateTime)) {
     // console.log("Store discount is available");
      const {
        discount: restaurentDiscount,
        discount_type: resDisType,
        min_purchase: restaurentMinimumPurchase,
        max_discount: restaurentMaxDiscount,
      } = storeData.discount;

      // Calculate shop-level total discount
      const totalDiscount = handleTotalDiscountBasedOnModules(
        items,
        restaurentDiscount,
        resDisType
      );

      // Calculate total purchased amount
      const purchasedAmount = items.reduce((total, product) => {
        const basePrice = product?.food_variations?.length > 0
          ? handleProductValueWithOutDiscount(product)
          : product?.selectedOption?.length>0?product?.price + (product?.selectedOption?.reduce?.((sum, opt) => sum + (opt?.price || 0), 0) || 0):product?.price;


        const addonPrice = product?.selectedAddons?.length > 0
          ? product.selectedAddons.reduce(
            (addonTotal, addOn) => addonTotal + addOn.price * addOn.quantity,
            0
          )
          : 0;

        return total + (basePrice + addonPrice) * product.quantity;
      }, 0);
      // If eligible for store discount, calculate the final applicable discount
      if (purchasedAmount >= restaurentMinimumPurchase) {
        const applicableStoreDiscount = Math.min(totalDiscount, restaurentMaxDiscount);
        if (diffDiscount) {
          diffDiscount.value = applicableStoreDiscount - productWiseDiscount;
        }

        // ✅ Return the higher discount: store vs product
        return Math.max(applicableStoreDiscount, productWiseDiscount);
      }
    }
  }

  // Return product-wise discount if no valid store-wide discount
  return productWiseDiscount;
};


export const getConvertDiscount = (dis, disType, price, restaurantDiscount) => {
  if (restaurantDiscount === 0) {
    if (dis !== 0) {
      if (disType === "amount") {
        price = price - dis;
      } else if (disType === "percent") {
        price = price - (dis / 100) * price;
      }
    }
    return price;
  } else {
    return price - (price * restaurantDiscount) / 100;
  }
};
export const getConvertDiscountNew = (dis, disType, price, restaurantDiscount) => {
  if (dis !== 0) {
    if (disType === "amount") {
      price = price - dis;
    } else if (disType === "percent") {
      price = price - (dis / 100) * price;
    }
  }
  return price;
};

export const getFinalTotalPrice = (
  items,
  couponDiscount,
  taxAmount,
  storeData
) => {
  let totalPrice = 0;
  if (items?.length > 0) {
    items.map((item) => {
      totalPrice +=
        item.price * item.quantity -
        getProductDiscount(items, storeData) +
        taxAmount;
    });
    if (couponDiscount && couponDiscount?.discount)
      return totalPrice - getCouponDiscount(couponDiscount, storeData, items);
    return totalPrice;
  }
  return totalPrice;
};

export const currentTime = moment(currentDate).format("HH:mm");

function recursive(start, end, close, list, schedule_order_slot_duration, day) {
  const checkedEnd = moment(end, "HH:mm").subtract(1, "minutes");
  const date =
    getDayNumber(today) === day
      ? moment(currentDate).format("yyyy-MM-DD")
      : nextday;
  if (
    end.isBefore(close) ||
    moment(end).format("HH:mm") === moment(close).format("HH:mm") ||
    moment(checkedEnd).format("HH:mm") === moment(close).format("HH:mm")
  ) {
    let label = "";
    if (
      currentTime > moment(start).format("HH:mm") &&
      currentTime < moment(end).format("HH:mm")
    ) {
      label = t("Now");
    } else {
      label = `${moment(start).format("HH:mm")} - ${moment(checkedEnd).format(
        "HH:mm"
      )}`;
    }
    if (
      (currentTime < moment(end).format("HH:mm") &&
        getDayNumber(today) === day) ||
      (currentTime > moment(end).format("HH:mm") && getDayNumber(today) !== day)
    ) {
      list.push({
        label: label,
        start: moment(start).format("HH:mm"),
        end:
          moment(checkedEnd).format("HH:mm") === moment(close).format("HH:mm")
            ? moment(checkedEnd).format("HH:mm")
            : moment(end).format("HH:mm"),
        value:
          moment(checkedEnd).format("HH:mm") === moment(close).format("HH:mm")
            ? `${date} ${moment(checkedEnd).format("HH:mm")}`
            : `${date} ${moment(end).format("HH:mm")}`,
      });
    }

    recursive(
      end,
      moment(end, "HH:mm").add(schedule_order_slot_duration, "minutes"),
      close,
      list,
      schedule_order_slot_duration,
      day
    );
  } else {
    return list;
  }
}

export const getAllSchedule = (
  day,
  schedules,
  schedule_order_slot_duration
) => {
  let list = [];
  if (schedules && schedules.length > 0) {
    const days = schedules.filter((s) => s.day === day);
    for (let index = 0; index < days.length; index++) {
      let close = moment(days[index].closing_time, "HH:mm");
      let start = moment(days[index].opening_time, "HH:mm");
      let end = moment(start, "HH:mm").add(
        schedule_order_slot_duration,
        "minutes"
      );
      recursive(start, end, close, list, schedule_order_slot_duration, day);
    }
  }
  return list;
};

function degreesToRadians(degrees) {
  return (degrees * Math.PI) / 180;
}

function radians(degrees) {
  return degrees * (Math.PI / 180);
}

const degrees = (doubleRadiance) => {
  return doubleRadiance * (180 / Math.PI);
};

const toRadians = (degree) => {
  return (degree * Math.PI) / 180;
};

function distanceInKmBetweenEarthCoordinates(lat1, lon1, lat2, lon2) {
  const earthRadius = 6378137.0;
  const startLatitude = lat1;
  const endLatitude = lat2;
  const startLongitude = lon1;
  const endLongitude = lon2;
  const dLat = toRadians(endLatitude - startLatitude);
  const dLon = toRadians(endLongitude - startLongitude);

  const a =
    Math.pow(Math.sin(dLat / 2), 2) +
    Math.pow(Math.sin(dLon / 2), 2) *
      Math.cos(toRadians(startLatitude)) *
      Math.cos(toRadians(endLatitude));
  const c = 2 * Math.asin(Math.sqrt(a));

  return earthRadius * c;
}

export const handleDistance = (distance, origin, destination) => {
  if (typeof distance?.distanceMeters === 'number') {
    return Number(distance?.distanceMeters) / 1000;
  } else if (distance?.status === "ZERO_RESULTS") {
    return (
      distanceInKmBetweenEarthCoordinates(
        origin?.latitude || origin?.lat,
        origin?.longitude || origin?.lng,
        destination?.lat || destination?.latitude,
        destination?.lng || destination?.longitude
      ) / 1000
    );
  } else {
    return 0;
  }
};

export const cartItemsTotalAmount = (cartList) => {
  let totalAmount = 0;
  if (cartList?.length > 0) {
    cartList?.forEach((item) => {
      totalAmount += handleTotalAmountWithAddons(
        getDiscountedAmount(
          item?.totalPrice,
          item?.discount,
          item?.discount_type,
          item?.store_discount,
          item?.quantity
        ),
        item?.selectedAddons
      );
    });
  }
  return totalAmount;
};

export const getInfoFromZoneData = (zoneData) => {
  let chargeInfo;
  if (zoneData?.data?.zone_data?.length > 0) {
    zoneData?.data?.zone_data?.forEach((item, index) => {
      if (item?.modules?.length > 0) {
        item?.modules?.forEach((moduleItem) => {
          if (
            moduleItem?.module_type === getCurrentModuleType() &&
            moduleItem?.id === getCurrentModuleId()
          ) {
            chargeInfo = {
              ...moduleItem,
              increased_delivery_fee_status:
                item?.increased_delivery_fee_status,
              increased_delivery_fee: item?.increased_delivery_fee,
            };
          }
        });
      }
    });
  }
  return chargeInfo;
};

export let bad_weather_fees = 0;

const getDeliveryFeeByBadWeather = (
  charge,
  increasedDeliveryFee,
  increasedDeliveryFeeStatus
) => {
  const totalCharge = charge;
  if (increasedDeliveryFeeStatus === 1) {
    const tempValue = totalCharge * (increasedDeliveryFee / 100);
    bad_weather_fees = tempValue;
    return totalCharge + tempValue;
  } else {
    return totalCharge;
  }
};

export const getDeliveryFees = (
  storeData,
  configData,
  cartList,
  distance,
  couponDiscount,
  couponType,
  orderType,
  zoneData,
  origin,
  destination,
  extraCharge
) => {
  if (orderType === "delivery" || orderType === "schedule_order") {
    //convert m to km
    let convertedDistance = handleDistance(
        distance,
      origin,
      destination
    );
    let deliveryFee = convertedDistance * configData?.per_km_shipping_charge;
    let totalOrderAmount = cartItemsTotalAmount(cartList);
    const isAdminFreeDeliveryEnabled = configData?.admin_free_delivery?.status === true;
    const freeDeliveryType = configData?.admin_free_delivery?.type;
    const freeDeliveryThreshold = configData?.admin_free_delivery?.free_delivery_over;
    const isFreeDeliveryByAmount =
      freeDeliveryType === "free_delivery_by_order_amount" &&
      freeDeliveryThreshold > 0 &&
      totalOrderAmount >= freeDeliveryThreshold;
    const isFreeDeliveryToAllStores = freeDeliveryType === "free_delivery_to_all_store";
    //restaurant self delivery system checking
    if (Number.parseInt(storeData?.self_delivery_system ) === 1) {
      const storeWiseDeliveryFee = convertedDistance * storeData?.per_km_shipping_charge || 0;
      if (storeData?.free_delivery || ((isAdminFreeDeliveryEnabled && (isFreeDeliveryByAmount || isFreeDeliveryToAllStores)))) {
        return 0;
      } else {
        deliveryFee =
          storeWiseDeliveryFee
        if (
          deliveryFee >= storeData?.minimum_shipping_charge &&
          deliveryFee <= storeData.maximum_shipping_charge
        ) {
          return deliveryFee;
        } else {
          if (deliveryFee < storeData?.minimum_shipping_charge) {
            return storeData?.minimum_shipping_charge;
          } else if (
            storeData?.maximum_shipping_charge !== null &&
            deliveryFee > storeData?.maximum_shipping_charge
          ) {
            return storeData?.maximum_shipping_charge;
          }
        }
      }
    } else {
      if (zoneData?.data?.zone_data?.length > 0) {
        const chargeInfo = getInfoFromZoneData(zoneData);
        if (
          chargeInfo?.pivot?.per_km_shipping_charge !== null &&
          chargeInfo?.pivot?.per_km_shipping_charge >= 0
        ) {
          deliveryFee =
            convertedDistance *
            (chargeInfo?.pivot?.per_km_shipping_charge || 0);
          if((isAdminFreeDeliveryEnabled && (isFreeDeliveryByAmount || isFreeDeliveryToAllStores)) ||
          orderType === "take_away") {
            return 0;
          } else if (
            deliveryFee <= chargeInfo?.pivot?.minimum_shipping_charge
          ) {
            return getDeliveryFeeByBadWeather(
              chargeInfo?.pivot?.minimum_shipping_charge + extraCharge,
              chargeInfo?.increased_delivery_fee,
              chargeInfo?.increased_delivery_fee_status
            );
          } else if (
            deliveryFee >= chargeInfo?.pivot?.maximum_shipping_charge &&
            chargeInfo?.pivot?.maximum_shipping_charge !== null
          ) {
            return getDeliveryFeeByBadWeather(
              chargeInfo?.pivot?.maximum_shipping_charge + extraCharge,
              chargeInfo?.increased_delivery_fee,
              chargeInfo?.increased_delivery_fee_status
            );
          } else {
            return getDeliveryFeeByBadWeather(
              deliveryFee + extraCharge,
              chargeInfo?.increased_delivery_fee,
              chargeInfo?.increased_delivery_fee_status
            );
          }
        }
      }
    }
  } else {
    return 0;
  }
};

export const getItemTotalWithoutDiscount = (item) => {
  return item?.price + handleVariationValuesSum(item.food_variations);
};

export const getSubTotalPrice = (cartList) => {
  if (getCurrentModuleType() === "food") {
    return cartList.reduce(
      (total, product) =>
        (product?.food_variations.length > 0
          ? getItemTotalWithoutDiscount(product)
          : product.price) *
          product.quantity +
        selectedAddonsTotal(product.selectedAddons) +
        total,
      0
    );
  } else {
    return cartList.reduce(
      (total, product) =>
        (product?.selectedOption?.length > 0
          ? product?.selectedOption?.[0]?.price
          : product.price) *
          product.quantity +
        total,
      0
    );
  }
};

const handleTaxIncludeExclude = (
  cartList,
  couponDiscount,
  storeData,
  referDiscount
) => {
  const stores = store?.getState();
  const { configData } = stores?.configData;
  if (configData && configData?.tax_included === 0) {
    return getTaxableTotalPrice(
      cartList,
      couponDiscount,
      storeData,
      referDiscount
    );
  } else {
    return 0;
  }
};

export const getCalculatedTotal = (
  cartList,
  couponDiscount,
  storeData,
  global,
  distanceData,
  couponType,
  orderType,
  freeDelivery,
  deliveryTip,
  zoneData,
  origin,
  destination,
  extraCharge,
  additionalCharge,
  packagingCharge,
  referDiscount,
  vatAmount
) => {
  const taxAmount=vatAmount|| 0
  if (couponDiscount) {
    if (couponDiscount?.coupon_type === "free_delivery") {
      return (
        getSubTotalPrice(cartList) -
        getProductDiscount(cartList, storeData) +
        taxAmount -
        (couponDiscount
          ? getCouponDiscount(couponDiscount, storeData, cartList)
          : 0)
      );
    } else {
      return (
        getSubTotalPrice(cartList) -
        getProductDiscount(cartList, storeData) +
        taxAmount -
        (couponDiscount
          ? getCouponDiscount(couponDiscount, storeData, cartList)
          : 0) +
        getDeliveryFees(
          storeData,
          global,
          cartList,
          distanceData?.data,
          couponDiscount,
          couponType,
          orderType,
          zoneData,
          origin,
          destination,
          extraCharge
        ) +
        deliveryTip +
        additionalCharge +
        packagingCharge
      );
    }
  } else {
    return (
      getSubTotalPrice(cartList) -
      getProductDiscount(cartList, storeData) +
      taxAmount -
      0 +
      getDeliveryFees(
        storeData,
        global,
        cartList,
        distanceData?.data,
        couponDiscount,
        couponType,
        orderType,
        zoneData,
        origin,
        destination,
        extraCharge
      ) +
      deliveryTip +
      additionalCharge +
      packagingCharge
    );
  }
};

export const isFoodAvailableBySchedule = (cart, selectedTime) => {
  if (selectedTime === "now") {
    let currentTime = moment();
    if (cart.length > 0) {
      let isAvailable = cart.every((item) => {
        const startTime = moment(item.available_time_starts, "HH:mm:ss");
        const endTime = moment(item.available_time_ends, "HH:mm:ss");
        return moment(currentTime).isBetween(startTime, endTime);
      });
      return !!isAvailable;
    }
  } else {
    if (selectedTime) {
      const slug = selectedTime.split(" ").pop();
      if (cart.length > 0) {
        const isAvailable = cart.every((item) => {
          const startTime = moment(item.available_time_starts, "HH:mm:ss");
          const endTime = moment(item.available_time_ends, "HH:mm:ss");
          const currentTime = moment(selectedTime, "HH:mm:ss");
          return moment(currentTime).isBetween(startTime, endTime);
        });
        return !!isAvailable;
      }
    }
  }
};

export const getVariation = (variations) => {
  let variation = "";
  if (variations?.length > 0) {
    variations.map((item, index) => {
      // if (index > 1) variation += `-${item.value}`
      // variation += item.value
      variation += `${index !== 0 ? "-" : ""}${item.value.type}`;
    });
  }
  return variation;
};

export const getTotalVariationsPrice = (variations) => {
  let value = 0;
  if (variations?.length > 0) {
    variations?.forEach?.((item) => {
      if (item?.values?.length > 0) {
        item?.values?.forEach((itemVal) => {
          if (itemVal?.isSelected) {
            value += Number.parseInt(itemVal?.optionPrice);
          }
        });
      }
    });
  }
  return value;
};

export const isObjectEmpty = (obj) => {
  return Object.keys(obj).length === 0 && obj.constructor === Object;
};

export const cartItemTotalDiscount = (cartList) => {
  let totalDiscount = 0;
  if (cartList?.length > 0) {
    cartList?.forEach((item) => {
      totalDiscount += getCartTotalDiscount(
        item?.totalPrice,
        item?.discount,
        item?.discount_type,
        item?.store_discount,
        item?.quantity
      );
    });
  }
  return totalDiscount;
};

export const getCartTotalDiscount = (
  price,
  discount,
  discountType,
  storeDiscount,
  quantity
) => {
  let discountTotal = 0;
  let q = quantity ? quantity : 1;
  if (Number.parseInt(storeDiscount) === 0) {
    if (discountType === "amount") {
      discountTotal = discount * q;
    } else if (discountType === "percent") {
      discountTotal = (discount / 100) * price;
    }
  } else {
    discountTotal = (storeDiscount / 100) * price;
  }
  return discountTotal;
};

// Sort products by high to low value
export const getHighToLow = (data) => {
  if (data?.length > 0) {
    return data.sort((a, b) => b.price - a.price);
  }
};
// Sort products by low to high value
const getLowToHigh = (data) => {
  if (data?.length > 0) {
    return data.sort((a, b) => a.price - b.price);
  }
};

export const removeDuplicates = (array, property) => {
  const uniqueValues = {};
  return array.filter((item) => {
    if (!uniqueValues[item[property]]) {
      uniqueValues[item[property]] = true;
      return true;
    }
    return false;
  });
};
export const getImageUrl = (storage, imageType, configData) => {
  if (!configData) return null;
  const storageMapping = {
    s3: configData.s3_base_urls,
    public: configData.base_urls,
    // Add more mappings as needed:
  };

  const baseUrlSet =
    storage === null || !storageMapping[storage?.value]
      ? configData.base_urls
      : storageMapping[storage?.value];

  const url = baseUrlSet?.[imageType];
  return url || null;
};
export const getHeaderImageUrl = (storage, imageType, landingData) => {
  if (!landingData) return null;
  const storageMapping = {
    s3: landingData.s3_base_urls,
    public: landingData.base_urls,
    // Add more mappings as needed:
  };

  const baseUrlSet =
    storage === null || !storageMapping[storage]
      ? landingData.base_urls
      : storageMapping[storage];

  const url = baseUrlSet?.[imageType];
  return url || null;
};

export const getHomePageBannerImageUrl = (storage, imageType, bannerData) => {
  if (storage === null || storage === "public") {
    return (
      bannerData.promotional_banner_url ||
      bannerData?.why_choose_url ||
      bannerData?.banner_video_content_url
    );
  } else if (storage === "s3") {
    return (
      bannerData.promotional_banner_s3_url ||
      bannerData?.why_choose_s3_url ||
      bannerData?.banner_video_content_s3_url
    );
  }
};
export const removeSpecialCharacters = (inputString) => {
  // Define the pattern for special characters
  const pattern = /[^a-zA-Z0-9\s]/g;

  // Use the replace method to remove special characters
  return inputString?.replace(pattern, "");
};
export const getDigitalMethodFromZone = (storeId, zoneData) => {
  if (zoneData?.zone_data?.length > 0) {
    const zone = zoneData?.zone_data?.find((item) => item?.id === storeId);
    if (zone) {
      return zone;
    }
  }
};
export function capitalizeText(text) {
  return text
    .split(" ") // Split the string into an array of words
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()) // Capitalize the first letter and make the rest lowercase
    .join(" "); // Join the words back into a string
}
export function formatPhoneNumber(number) {
  const str = number.toString();
  if (str.startsWith("+")) {
    return str;
  } else {
    return `+${str}`;
  }
}

function isEmail(input) {
  const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailPattern.test(input);
}
function isPhoneNumber(input) {
  const phonePattern =
    /^\+?[0-9]{1,4}?[-.s]?(\(?\d{1,3}?\))?[-.s]?\d{1,4}[-.s]?\d{1,4}[-.s]?\d{1,9}$/;
  return phonePattern.test(input);
}
export function checkInput(input) {
  if (isEmail(input)) {
    return "email";
  } else if (isPhoneNumber(input)) {
    return "phone";
  } else {
    return "invalid";
  }
}
export function maskSensitiveInfo(input) {
  if (input) {
    if (input?.includes("@")) {
      const [localPart, domain] = input.split("@");
      const maskedLocalPart =
        localPart.slice(0, 2) + "*".repeat(localPart.length - 2);

      return `${maskedLocalPart}@${domain}`;
    } else {
      const maskedSection = input.slice(4, -3).replace(/\d/g, "*");
      return input.slice(0, 4) + maskedSection + input.slice(-3);
    }
  }
}
