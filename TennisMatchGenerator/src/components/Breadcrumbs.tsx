import { Breadcrumbs, Link, Typography } from "@mui/material";
import { Link as RouterLink, useLocation } from "react-router-dom";
import { RoutePath } from "../model/RoutePath";

export const CustomBreadcrumbs = () => {
    const location = useLocation();
    const pathnames = location.pathname.split("/").filter((x) => x);

    const getRouteDisplayName = (pathSegment: string): string => {
        const route = Object.values(RoutePath).find((route) => route.path.toUpperCase() === pathSegment.toUpperCase());
        return route ? route.displayName : pathSegment.charAt(0).toUpperCase() + pathSegment.slice(1); // Default to capitalized segment if not found
    };

    return (
        <Breadcrumbs aria-label="breadcrumb">
            <Link component={RouterLink} to="/" underline="hover">
                Home
            </Link>
            {pathnames.map((value, index) => {
                const to = `/${pathnames.slice(0, index + 1).join("/")}`;
                const isLast = index === pathnames.length - 1;
                const breadcrumbLabel = getRouteDisplayName(value.toUpperCase());

                return isLast ? (
                    <Typography key={to} color="text.primary">
                        {breadcrumbLabel}
                    </Typography>
                ) : (
                    <Link key={to} component={RouterLink} to={to} underline="hover">
                        {breadcrumbLabel}
                    </Link>
                );
            })}
        </Breadcrumbs>
    );
};

