import { Events } from "discord.js";
import { Event } from "../typings/Client";

export default {
    name: Events.Raw,
    execute: async (client, d) => {
        client.lavalink.sendRawData(d);  // VERY IMPORTANT!
    }
} as Event;