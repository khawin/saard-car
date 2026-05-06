export const store = {
    dataBookings: [],
    dataVehicles: [],
    dataDrivers: [],
    dataUsers: [],
    currentUser: null,
    currentRole: 'teacher',
    currentFilter: 'all',
    manageMode: 'vehicle',
    refreshTimer: null,
    fpTimeline: null,
    curPageBookings: 1,
    curBookingsData: [],
    curPageManage: 1,
    curManageData: []
};

export const ITEMS_PER_PAGE = 10;
