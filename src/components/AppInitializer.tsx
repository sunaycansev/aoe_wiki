import { useEffect } from "react";
import { useDispatch } from "react-redux";

import { fetchUnitsStart } from "../store/slices/unitsSlice";
import { AppDispatch } from "../store/store";

export const AppInitializer = () => {
  const dispatch: AppDispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchUnitsStart());
  }, [dispatch]);

  return null;
};
