import { Grid, Skeleton, styled } from "@mui/material";
import React from "react";
import CustomImageContainer from "../../CustomImageContainer";

import { Box } from "@mui/system";
import { getImageUrl } from "utils/CustomFunctions";
import NextImage from "components/NextImage";

const ImageContainer = styled(Box)(({ theme }) => ({
  position: "relative",
  width: "100%",
  borderRadius: "8px",
  maxHeight: "190px",
  maxWidth: "200px",
  overflow: "hidden",
  img:{
    width:"100%",
    height: "100%",},
  [theme.breakpoints.up("md")]: {
    height: "190px",
  },
  "&:hover img": {
    transform: "scale(1.04)",
  },
}));
export const Shimmer = () => (
  <>
    {[...Array(4)].map((item, index) => {
      return (
        <Grid item xs={4} sm={4} md={2.4} key={index} align="center">
          <ImageContainer>
            <Skeleton variant="rectangle" height="100%" width="100%" />
          </ImageContainer>
        </Grid>
      );
    })}
  </>
);
const Grocery = (props) => {
  const { runningCampaigns, handleClick, configData, isFetching } = props;

  return (
    <Grid container spacing={2}>
      {runningCampaigns?.map((item, index) => {
        return (
          <Grid
            item
            xs={4}
            sm={3}
            md={2.4}
            lg={2}
            key={index}
            align="center"
            onClick={() => handleClick(item)}
            sx={{ cursor: "pointer" }}
          >
            <ImageContainer>
              <NextImage
                src={item?.image_full_url}
                alt={item?.title}
                height={190}
                width={200}
                objectfit="cover"
              />
            </ImageContainer>
          </Grid>
        );
      })}
      {isFetching && <Shimmer />}
    </Grid>
  );
};

Grocery.propTypes = {};

export default Grocery;
