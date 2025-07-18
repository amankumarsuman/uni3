import React, { useEffect, useState } from "react";
import { CustomBoxFullWidth } from "styled-components/CustomStyles.style";
import { Grid, Skeleton, styled, useMediaQuery, useTheme } from "@mui/material";
import H1 from "../typographies/H1";
import HighToLow from "../../sort/HighToLow";
import { Box } from "@mui/system";
import WindowIcon from "@mui/icons-material/Window";
import Body2 from "../typographies/Body2";
import ViewListIcon from "@mui/icons-material/ViewList";
import Filter from "../home/stores/Filter";
import Funnel from "../svg-components/Funnel";
import { t } from "i18next";
import NewSortBy from "components/search/NewSortBy";

const ViewWrapper = styled(Box)(({ theme, active }) => ({
	display: "flex",
	direction: "row",
	alignItems: "center",
	justifyContent: "center",
	height: "100%",
	gap: "5px",
	cursor: "pointer",
	color:
		active === "true"
			? theme.palette.primary.main
			: theme.palette.neutral[500],
}));

const SearchMenu = (props) => {
	const {
		currentView,
		setCurrentView,
		handleSortBy,
		sortBy,
		totalDataCount,
		currentTab,
		tabs,
		isRefetching,
		setOpenSideDrawer,
		priceRange,
		filterDataAndFunctions,
		filterData,
		setFilterData,
		setIsClicked,
		isFetchingNextPage,
		minMax,
		setMinMax,
		handleSortByNew,
		newSort,
	} = props;
	const total = 1000;
	const [showView, setShowView] = useState(true);
	const theme = useTheme();
	const isSmallSize = useMediaQuery(theme.breakpoints.down("sm"));
	useEffect(() => {
		if (currentTab === 0) {
			setShowView(true);
		} else {
			setShowView(false);
		}
	}, [currentTab]);
	const found = t("Found");
	const textHandler = () => {
		return `${totalDataCount ?? 0} ${tabs[currentTab]?.value} ${found}`;
	};

	return (
		<CustomBoxFullWidth sx={{ marginBottom: "20px" }}>
			<Grid container alignItems="center" justifyContent="center">
				<Grid item xs={9} md={6}>
					{isFetchingNextPage ? (
						<Skeleton variant="text" width="150px" />
					) : (
						<H1
							textTransform="capitalize"
							textAlign="start"
							text={textHandler()}
						/>
					)}
				</Grid>
				<Grid item xs={3} md={6} container spacing={2}>
					<Grid item xs={3} md={2}>
						{showView ? (
							<ViewWrapper
								active={currentView === 0 ? "true" : "false"}
								onClick={() => setCurrentView(0)}
							>
								<WindowIcon />
								{isSmallSize ? null : (
									<Body2 text="Grid view" />
								)}
							</ViewWrapper>
						) : null}
					</Grid>
					<Grid item xs={4} md={2}>
						{showView ? (
							<ViewWrapper
								active={currentView === 1 ? "true" : "false"}
								onClick={() => setCurrentView(1)}
							>
								<ViewListIcon sx={{ fontSize: "30px" }} />
								{isSmallSize ? null : (
									<Body2 text="List view" />
								)}
							</ViewWrapper>
						) : null}
					</Grid>
					{isSmallSize ? null : (
						<Grid item xs={0} md={5.5} align="center">
							{showView ? (
								<HighToLow
									handleSortBy={handleSortBy}
									sortBy={sortBy}
								/>
							) : null}
						</Grid>
					)}
					{isSmallSize ? null : (
						<>
							{currentTab === 1 && (
								<Grid item xs={0} md={9.5} align="right">
									<NewSortBy
										handleSortBy={handleSortByNew}
										newSort={newSort}
									/>
								</Grid>
							)}
						</>
					)}
					<Grid item xs={5} md={2.5}>
						{isSmallSize ? (
							<Box
								onClick={() => setOpenSideDrawer(true)}
								sx={{
									display: "flex",
									alignItems: "center",
									justifyContent: "center",
									color: "primary.main",
									border: (theme) =>
										`1px solid ${theme.palette.primary.main}`,
									borderRadius: { xs: "3px", sm: "8px" },
									paddingTop: "5px",
									cursor: "pointer",
									"&:hover": {
										backgroundColor: (theme) =>
											theme.palette.primary.secondary,
									},
									// width: "40px",
								}}
							>
								<Funnel />
							</Box>
						) : (
							<Filter
								minMax={minMax}
								setMinMax={setMinMax}
								border
								priceRange={priceRange}
								filterDataAndFunctions={filterDataAndFunctions}
								filterData={filterData}
								setFilterData={setFilterData}
								currentTab={currentTab}
							/>
						)}
					</Grid>
				</Grid>
			</Grid>
		</CustomBoxFullWidth>
	);
};

SearchMenu.propTypes = {};

export default SearchMenu;
