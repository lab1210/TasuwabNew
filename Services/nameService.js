import branchService from "./branchService";
import departmentService from "./departmentService";
import positionService from "./positionService";

export async function fetchDepartmentName(departmentCode) {
  try {
    const response = await departmentService.getDepartmentById(departmentCode);
    if (response?.name) {
      return response.name;
    }
    return null;
  } catch (error) {
    console.error("Error fetching department name:", error);
    return null;
  }
}

export async function fetchBranchName(branchCode) {
  try {
    const response = await branchService.getBranchById(branchCode);
    if (response?.name) {
      return response.name;
    }
    return null;
  } catch (error) {
    console.error("Error fetching branch name:", error);
    return null;
  }
}

export async function fetchPositionName(positionCode) {
  try {
    const response = await positionService.getPositionById(positionCode);
    if (response?.name) {
      return response.name;
    }
    return null;
  } catch (error) {
    console.error("Error fetching position name:", error);
    return null;
  }
}
