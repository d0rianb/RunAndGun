export const constants = {
    physics: {
        collision: {
            collisionCategory: {
                body: 0x0010,
                arm: 0x0011,
                shot: 0x0010,
                wall: 0x0010
            },
            collisionGroup: {
                body: 1,
                arm: 2,
                shot: 1,
                wall: 1
            },
            collisionMask: {
                body: 0x010001,
                arm: 0x010001,
                wall: 0x010001,
                shot: 0x010001
            }
        },
        gravity: {
            scale: 0.00195
        }
    }
}