import { Button, styled, Typography } from "@mui/material";
import { Box } from "@mui/system";
import React from "react";
import { useTranslation } from "react-i18next";
import { CustomStackFullWidth } from "../../styled-components/CustomStyles.style";
import CustomImageContainer from "../CustomImageContainer";
import promotionalBanner from "./assets/promotional_banner.png";
import NextImage from "components/NextImage";

export const BannerWrapper = styled(Box)(({ theme }) => ({
  width: "100%",
  height: "360px",
  position: "relative",
  marginTop: "20px",
  img:{
    width: "100%",
    height: "100%",

  },
  "&:hover": {
    img: {
      transform: "scale(1.02)",
    },
  },
  [theme.breakpoints.down("sm")]: {
    height: "120px",
  },
}));
export const ContentWrapper = styled(CustomStackFullWidth)(({ theme }) => ({
  position: "absolute",
  top: 0,
}));
export const CustomTypography = styled(Typography)(({ theme }) => ({
  fontFamily: "Quicksand",
  fontWeight: "700",
  fontSize: "16px",
  // lineHeight: "48px",
  [theme.breakpoints.up("sm")]: {
    fontSize: "2.5rem",
  },
}));
export const CustomButton = styled(Button)(({ theme }) => ({
  backgroundColor: theme.palette.primary.customType2,
  marginTop: "10px",
}));

const PromotionalBanner = ({ bannerData }) => {
  const { t } = useTranslation();
  const data = {
    img: promotionalBanner,
    offerType: "Summer offer",
    header: "Up To 50% Off All Product.",
    subHeader: "We provide best quality & fresh grocery items",
  };

  return (
    <>
      {bannerData?.bottom_section_banner && (
        <BannerWrapper>
          <NextImage
            src={bannerData?.bottom_section_banner_full_url}
            height={360}
            width={1440}
            objectFit="cover"
          />
        </BannerWrapper>
      )}
    </>
  );
};

PromotionalBanner.propTypes = {};

export default PromotionalBanner;
