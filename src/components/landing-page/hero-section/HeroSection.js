import {
  Box,
  Grid,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { Stack } from "@mui/system";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  CustomBoxFullWidth,
  CustomStackFullWidth,
} from "styled-components/CustomStyles.style";
import CustomContainer from "../../container";
import MobileFrame from "../assets/MobileFrame";
import HeroLocationForm from "./HeroLocationForm";
import HeroTitleSection from "./HeroTitleSection";
import HeroBgSvg from "components/landing-page/HeroBgSvg";
import NextImage from "components/NextImage";

const DynamicModuleSelection = dynamic(() =>
  import("./module-selection/ModuleSelectionRaw")
);
const HeroSection = ({ landingPageData }) => {
  const theme = useTheme();
  const isXSmall = useMediaQuery(theme.breakpoints.down("sm"));
  const isSmall = useMediaQuery(theme.breakpoints.down("md"));
  const { t } = useTranslation();
  const [currentLocation, setCurrentLocation] = useState(null);
  useEffect(() => {
    if (typeof window !== "undefined") {
      setCurrentLocation(window.localStorage.getItem("location"));
    }
  }, []);

  const calculateTopMargin = () => {
    if (currentLocation) {
      return {
        xs: "4rem",
        sm: "5rem",
        md: "7rem",
      };
    } else {
      return {
        xs: "4rem",
        sm: "5rem",
        md: "5rem",
      };
    }
  };

  return (
    <CustomContainer>
      <CustomBoxFullWidth
        sx={{
          marginTop: calculateTopMargin(),
          borderRadius: "20px",
          position: "relative",
          overflow: "hidden",
          ".shape img": {
            transition: "all ease-in 1s",
          },
        }}
      >
        <Box
          sx={{ position: "absolute", pointerEvents: "none" }}
          className="shape"
        >
          <HeroBgSvg />
        </Box>
        <Grid container>
          <Grid
            item
            xs={8}
            md={7}
            sx={{ padding: { xs: "1rem", sm: "2rem", md: "3rem" } }}
          >
            <HeroTitleSection
              landingPageData={landingPageData}
            />
          </Grid>
          <Grid item xs={4} md={5} align="right">
            <CustomStackFullWidth
              height="100%"
              alignItems="flex-start"
              justifyContent="flex-end"
              paddingTop={{ xs: "2rem", md: "3rem" }}
            >
              <Box
                sx={{
                  height: { xs: "125px", sm: "350px", md: "420px" },
                  width: { xs: "78px", sm: "210px", md: "240px" },
                  borderRadius: isXSmall ? "5px 5px 0 0" : "16px 16px 0 0",
                  position: "relative",
                  zIndex: "99",
                  backgroundImage: `url(${landingPageData?.header_banner_full_url})`,
                  backgroundSize: "cover",
                  backgroundRepeat: "no-repeat",
                  marginInline: "auto",
                  padding: "0",
                }}
              >
                {landingPageData?.header_banner_full_url && (
                  <Stack margin={isXSmall ? "-5px 0 0 -3px" : "-5px 0 0 -3px"}>
                    <MobileFrame
                      width={isXSmall ? "85" : isSmall ? "215" : "246"}
                      height={isXSmall ? "148" : isSmall ? "370" : "427"}
                    />
                  </Stack>
                )}
              </Box>
              <Box
                sx={{
                  position: "absolute",
                  width: { xs: "50px", sm: "120px", md: "210px" },
                  height: { xs: "50px", sm: "110px", md: "190px" },
                  bottom: isXSmall ? 5 : 16,
                  right: { xs: 7, sm: 10, md: 30 },
                  zIndex: 100,
                }}
              >
                <NextImage
                  src={landingPageData?.header_icon_full_url}
                  alt={t("icon")}
                  width={210}
                  height={190}
                  objectFit="cover"
                  priority
                />
              </Box>
            </CustomStackFullWidth>
          </Grid>
        </Grid>
      </CustomBoxFullWidth>
      {isXSmall && (
        <>
          {currentLocation ? (
            <DynamicModuleSelection isSmall />
          ) : (
            <CustomStackFullWidth mt="10px">
              <HeroLocationForm />
            </CustomStackFullWidth>
          )}
        </>
      )}
    </CustomContainer>
  );
};

export default HeroSection;
