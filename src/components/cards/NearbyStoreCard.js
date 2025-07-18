import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import { alpha, styled, Typography } from "@mui/material";
import { Box } from "@mui/system";
import { useAddStoreToWishlist } from "api-manage/hooks/react-query/wish-list/useAddStoreToWishLists";
import { useWishListStoreDelete } from "api-manage/hooks/react-query/wish-list/useWishListStoreDelete";
import { DistanceCalculate } from "helper-functions/DistanceCalculate";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { addWishListStore, removeWishListStore } from "redux/slices/wishList";
import {
  CustomBoxFullWidth,
  CustomStackFullWidth,
} from "styled-components/CustomStyles.style";
import { textWithEllipsis } from "styled-components/TextWithEllipsis";
import { not_logged_in_message } from "utils/toasterMessages";
import CustomImageContainer from "../CustomImageContainer";
import CustomMultipleRatings from "../CustomMultipleRatings";
import ClosedNow from "../closed-now";
import { PrimaryToolTip } from "./QuickView";
import map from "./assets/map.png";
import NextImage from "components/NextImage";

const CustomStyledStack = styled(CustomStackFullWidth)(({ theme }) => ({
  background: theme.palette.neutral[100],
  border: `1px solid ${alpha(theme.palette.neutral[600], 0.2)}`,
  borderRadius: "10px",
  cursor: "pointer",
  "&:hover img": {
    transform: "scale(1.04)",
  },
  // ".MuiTypography-subtitle1": {
  //   transition: "all ease 0.5s",
  // },
  // "&:hover .MuiTypography-subtitle1": {
  //   color: theme.palette.primary.main,
  //   letterSpacing: "0.02em",
  // },
}));

const CustomStyledBox = styled(CustomBoxFullWidth)(({ theme }) => ({
  borderRadius: "10px 10px 0px 0px",
  height: "100px",
  opacity: 2,
  position: "relative",
  overflow: "hidden",
  img:{
    width: "100%",
    height: "100%",
  }
}));

const CustomStyledStackInner = styled(CustomStackFullWidth)(({ theme }) => ({
  paddingLeft: "25px",
  paddingRight: "25px",
  paddingBottom: "14px",
  [theme.breakpoints.down("sm")]: {
    paddingLeft: "10px",
    paddingRight: "10px",
  },
}));

const ColoredBox = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "row",
  justifyContent: "center",
  alignItems: "center",
  padding: "3px 5px",
  gap: "2px",
  background: theme.palette.primary.main,
  boxShadow: "0px 3px 4px rgba(0, 0, 0, 0.08)",
  borderRadius: "10px",
  color: theme.palette.whiteContainer.main,
}));

const CustomSpan = styled("span")(({ theme }) => ({
  fontWeight: "bold",
}));
const CustomLogoContainer = styled("span")(({ theme }) => ({
  height: "65px",
  width: "95px",
  border: `0.5px solid ${theme.palette.neutral[200]}`,
  borderRadius: "10px",
  position: "relative",
  marginTop: "-30px",
  overflow: "hidden",
  img:{
    width: "100%",
    height: "100%",
  },
  [theme.breakpoints.down("sm")]: {
    height: "57px",
    width: "80px",
    marginTop: "-26px",
  },
}));

const NearbyStoreCard = (props) => {
  const { item } = props;
  const { wishLists } = useSelector((state) => state.wishList);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const moduleId = JSON.parse(window.localStorage.getItem("module"))?.id;
  const classes = textWithEllipsis();
  const { t } = useTranslation();
  const { mutate: addFavoriteMutation } = useAddStoreToWishlist();
  const reduxDispatch = useDispatch();
  const { mutate } = useWishListStoreDelete();
  const router = useRouter();
  useEffect(() => {
    wishlistItemExistHandler();
  }, [wishLists]);
  const wishlistItemExistHandler = () => {
    if (wishLists?.store?.find((wishItem) => wishItem.id === item?.id)) {
      setIsWishlisted(true);
    } else {
      setIsWishlisted(false);
    }
  };
  const handleClick = () => {
    router.push({
      pathname: `/store/[id]`,
      query: {
        id: `${item?.slug ? item?.slug : item?.id}`,
        module_id: `${moduleId}`,
        // lat: currentLocation?.lat,
        // lng: currentLocation?.lng,
        distance: item.distance,
        store_zone_id: `${item?.zone_id}`,
      },
    });
  };
  const addToWishlistHandler = (e) => {
    e.stopPropagation();
    let token = undefined;
    if (typeof window !== "undefined") {
      token = localStorage.getItem("token");
    }
    if (token) {
      addFavoriteMutation(item?.id, {
        onSuccess: (response) => {
          if (response) {
            reduxDispatch(addWishListStore(item));
            setIsWishlisted(true);
            toast.success(response?.message);
          }
        },
        onError: (error) => {
          toast.error(error.response.data.message);
        },
      });
    } else toast.error(t(not_logged_in_message));
  };

  const removeFromWishlistHandler = (e) => {
    e.stopPropagation();
    const onSuccessHandlerForDelete = (res) => {
      reduxDispatch(removeWishListStore(item?.id));
      setIsWishlisted(false);
      toast.success(res.message, {
        id: "wishlist",
      });
    };
    mutate(item?.id, {
      onSuccess: onSuccessHandlerForDelete,
      onError: (error) => {
        toast.error(error.response.data.message);
      },
    });
  };

  return (
    <CustomStyledStack onClick={handleClick}>
      <CustomStyledBox>
        <NextImage
          src={item?.cover_photo_full_url}
          alt={item?.name}
          height={100}
          width={281}
          borderRadius="10px 10px 0px 0px"
          objectFit="cover"
        />
      </CustomStyledBox>
      <CustomStyledStackInner spacing={0.5}>
        <CustomStackFullWidth
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          mb="10px"
        >
          <CustomLogoContainer
            sx={{ overflow: "hidden", borderRadius: "10px" }}
          >
            <NextImage
              src={item?.logo_full_url}
              alt={item?.name}
              height={65}
              width={95}
              objectfit="cover"
            />
            <ClosedNow
              active={item?.active}
              open={item?.open}
              borderRadius="10px"
            />
          </CustomLogoContainer>
          <CustomStackFullWidth
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            spacing={1}
            pl="7px"
          >
            <CustomMultipleRatings rating={item?.avg_rating} PrimaryColor />
            {isWishlisted ? (
              <FavoriteIcon
                sx={{ fontSize: { xs: "17px", md: "15px" } }}
                color="primary"
                onClick={(e) => removeFromWishlistHandler(e)}
              />
            ) : (
              <FavoriteBorderIcon
                sx={{ fontSize: { xs: "17px", md: "15px" } }}
                color="primary"
                onClick={(e) => addToWishlistHandler(e)}
              />
            )}
          </CustomStackFullWidth>
        </CustomStackFullWidth>
        <PrimaryToolTip text={item?.name} placement="bottom" arrow="false">
          <Typography
            className={classes.singleLineEllipsis}
            fontSize={{ xs: "13px", md: "16px" }}
            fontWeight="500"
            component="h3"
          >
            {item?.name}
          </Typography>
        </PrimaryToolTip>
        {/*<H3 text={item?.name} />*/}
        <Typography
          textAlign="flex-start"
          className={classes.singleLineEllipsis}
          maxHeight="20px"
          variant="body2"
          color="text.secondary"
        >
          {item?.address}
        </Typography>
        <CustomStackFullWidth alignItems="flex-start" pt="12px">
          <ColoredBox>
            <CustomImageContainer
              src={map.src}
              alt={t("map")}
              height="14px"
              width="13px"
              objectFit="cover"
            />
            <Typography>
              <CustomSpan>
                <DistanceCalculate distance={item.distance} />
              </CustomSpan>
              {t("from you")}
            </Typography>
          </ColoredBox>
        </CustomStackFullWidth>
      </CustomStyledStackInner>
    </CustomStyledStack>
  );
};

NearbyStoreCard.propTypes = {};

export default NearbyStoreCard;
