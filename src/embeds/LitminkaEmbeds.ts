import { EmbedBuilder, Colors } from "discord.js";
import { client } from "../app";
import { Anime, AnimeAnnouncement, GroupType, User, WatchListWithAnime } from "../typings/anime";
import { ParseSeason, ParseMediaType } from "../utils/parsers";
import BaseEmbeds from "./BaseEmbeds";
import { Guild } from "@prisma/client";

export default class LitminkaEmbeds {
    static animeStatus = {
        planned: 'Запланировано',
        watching: 'Смотрю',
        rewatching: 'Пересматриваю',
        completed: 'Просмотрено',
        on_hold: 'Отложено',
        dropped: 'Брошено',
        announced: 'Анонсировано',
        released: 'Вышло',
        ongoing: 'Выходит',
    }

    public static async UserProfile(user: User): Promise<EmbedBuilder> {
        const discordUser = await client.users.fetch(`${user.integration.discordId}`);
        const embed = BaseEmbeds.Info("Информация о пользователе")
            .addFields([
                {
                    name: "**Имя**",
                    value: discordUser.username,
                    inline: true
                },
                {
                    name: `**Уведомлять о новых сериях**`,
                    value: user.settings.notifyDiscord ? `Да` : `Нет`
                }
            ])
            .setThumbnail(discordUser.avatarURL())

        return embed;
    }

    public static async GuildProfile(guild: Guild): Promise<EmbedBuilder> {
        const embed = BaseEmbeds.Info("Информация о сервере")
            .addFields([
                {
                    name: "**Наименование**",
                    value: guild.name,
                    inline: true
                },
                {
                    name: `**Уведомлять о новых сериях**`,
                    value: guild.isNotifiable ? `Да` : `Нет`
                }
            ])
            .setThumbnail(guild.icon || (await client.guilds.cache.get(guild.guildId)).iconURL())
        if (guild.isNotifiable)
            embed.addFields([
                {
                    name: `**Канал для уведомлений**`,
                    value: guild.notifyChannelId ? `<#${guild.notifyChannelId}>` : `Не установлен`
                }
            ])
        return embed;
    }

    public static AnimeRelease(announcement: AnimeAnnouncement): EmbedBuilder {
        let animeURL = `https://litminka.ru/anime/${announcement.slug}?`;
        if (announcement.episode != null) animeURL += `episode=${announcement.episode}&`;
        if (announcement.groupName != null) animeURL += `translation=${announcement.groupName}&`;
        const embed = BaseEmbeds.Anime(`Аниме начало выходить!`)
            .setDescription(`**${announcement.animeName}**`);
        if (/^https?:\/\//.test(announcement.image)) embed.setImage(announcement.image);
        if (/^https?:\/\//.test(animeURL)) embed.setURL(animeURL);
        return embed;
    }

    public static NewEpisode(announcement: AnimeAnnouncement): EmbedBuilder {
        const embed = LitminkaEmbeds.AnimeRelease(announcement)
            .setTitle(`Вышла новая серия!`)
            .addFields([
                {
                    name: "**Эпизод**",
                    value: `${announcement.episode} / ${announcement.maxEpisodes ? announcement.maxEpisodes : `?`}`,
                    inline: true
                },
                {
                    name: `**${announcement.groupType === GroupType.Voice ? `Озвучка` : `Субтитры`}**`,
                    value: `${announcement.groupName}`,
                    inline: true
                },
            ])

        return embed;
    }
    public static FinalEpisode(announcement: AnimeAnnouncement): EmbedBuilder {
        const embed = LitminkaEmbeds.NewEpisode(announcement)
            .setTitle(`Вышла последняя серия!`)
            .setColor(Colors.Gold)
        return embed;
    }

    public static ShowWatchlist(list: WatchListWithAnime[]): EmbedBuilder[] {
        const embeds = [];
        for (let anime of list) {
            embeds.push(LitminkaEmbeds.WatchlistAnimeInfo(anime));
        }
        return embeds;
    }

    public static ShowAnimeSearch(list: Anime[]): EmbedBuilder[] {
        const embeds = [];
        for (let anime of list) {
            embeds.push(LitminkaEmbeds.AnimeShortInfo(anime));
        }
        return embeds;
    }
    public static AnimeShortInfo(anime: Anime): EmbedBuilder {
        const animeURL = `https://litminka.ru/anime/${anime.slug}`;
        
        const embed = BaseEmbeds.Anime(`${anime.name}`)
            .addFields([
                {
                    name: `**Рейтинг**`,
                    value: `${anime.rating ?? (anime.shikimoriRating ?? `?`)} / 10`,
                    inline: true
                },
                {
                    name: `**Тип**`,
                    value: ParseMediaType(anime.mediaType),
                    inline: true
                },
                {
                    name: `**Жанры**`,
                    value: (anime.genres.map(genre => genre.nameRussian)).join(`, `)
                }
            ])
        if (/^https?:\/\//.test(anime.image)) embed.setThumbnail(anime.image);
        if (/^https?:\/\//.test(animeURL)) embed.setURL(animeURL);

        return embed
    }

    public static WatchlistAnimeInfo(record: WatchListWithAnime) {
        const { isFavorite, rating, status, watchedEpisodes, anime } = record;
        const animeURL = `https://litminka.ru/anime/${anime.slug}`;
        
        //let title = createFilledString(anime.name);
        const embed = BaseEmbeds.Anime(`${anime.name}`)
            .addFields([
                {
                    name: `**${LitminkaEmbeds.animeStatus[status]}**`,
                    value: `${watchedEpisodes} / ${anime.maxEpisodes ? anime.maxEpisodes : `?`}`,
                    inline: true,
                },
                {
                    name: `**Рейтинг**`,
                    value: `${rating} / 10`,
                    inline: true
                },
                {
                    name: `${isFavorite ? `❤️` : `🤍`}`,
                    value: ` `,
                    inline: true,
                },
                {
                    name: `**Сезон выпуска**`,
                    value: ParseSeason(anime.season),
                    inline: true
                },
                {
                    name: `**Тип**`,
                    value: ParseMediaType(anime.mediaType),
                    inline: true
                }
            ])
        if (/^https?:\/\//.test(anime.image)) embed.setThumbnail(anime.image);
        if (/^https?:\/\//.test(animeURL)) embed.setURL(animeURL);

        return embed
    }
}