const OSD_BYTE_CODES: any = {
    lq: {
        values: [123],
    },
    battery: {
        values: [144, 145, 146, 147, 148, 149] 
    },
    rssi: {
        values: [1]
    },
    latitude: {
        values: [137]
    },
    longitude: {
        values: [152]
    },
    timer: {
        values: [155]
    },
    speed: {
        values: [112],
        add: 22
    },
    altitude: {
        values: [127]
    },
    distance_from_home: {
        values: [17]
    },
    sats: {
        values: [31, 32]
    }
};
export default OSD_BYTE_CODES;