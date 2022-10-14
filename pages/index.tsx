import {
    Flex,
    Image,
    VStack,
    HStack,
    Text,
    Button,
    Spacer,
    useToast,
    Tooltip,
    useDisclosure
} from "@chakra-ui/react"

import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  ModalFooter
} from "@chakra-ui/react"

import {
    useEffect,
    useState
} from "react"

import {
    Link,
    LoginResult,
    LinkSession
} from "anchor-link"

import AnchorLinkBrowserTransport from "anchor-link-browser-transport"
import axios from "axios"

const on_hand_style = {
    w: "70px",
    h: "70px",
    border: "2px solid",
    borderColor: "white",
    rounded: "5px",
    backdropFilter: "blur(5px)",
    cursor: "pointer"
}

const block_style = {
    w: "50px",
    h: "50px",
    border: "2px solid",
    borderColor: "white",
    rounded: "5px",
    backdropFilter: "blur(2px)",
    cursor: "pointer"
}

interface Asset {
    asset_id: "string",
    blocks: number,
    current_time: number,
    cooldown_hr: number,
    energy: number,
    max_energy: number,
    rarity: string,
    type: string
}

interface Block {
    status: string,
    rarity: string,
    current_time: number,
    cooldown_hr: number
}

const Index = () => {
    const [link, setLink] = useState<Link>(null)
    const [session, setSession] = useState<LinkSession>(null)

    const [energy, setEnergy] = useState<number>(0)
    const [max_energy, setMaxEnergy] = useState<number>(0)
    const [token, setToken] = useState<string>("0.00")

    const [seed_common, setSeedCommon] = useState<number>(0)
    const [seed_uncommon, setSeedUncommon] = useState<number>(0)
    const [seed_rare, setSeedRare] = useState<number>(0)
    const [seed_legendary, setSeedLegendary] = useState<number>(0)

    const [reward_common, setRewardCommon] = useState<number>(0)
    const [reward_uncommon, setRewardUncommon] = useState<number>(0)
    const [reward_rare, setRewardRare] = useState<number>(0)
    const [reward_legendary, setRewardLegendary] = useState<number>(0)

    const [assets, setAssets] = useState<Array<Asset>>([])

    const [hoe_tools, setHoeTools] = useState<Array<Asset>>([])
    const [watering_can_tools, setWateringCanTools] = useState<Array<Asset>>([])
    const [axe_tools, setAxeTools] = useState<Array<Asset>>([])

    const [land_blocks, setLandBlocks] = useState<Array<Block>>([
        {
            status: "ready",
            rarity: "",
            current_time: 0,
            cooldown_hr: 0
        },
        {
            status: "ready",
            rarity: "",
            current_time: 0,
            cooldown_hr: 0
        },
        {
            status: "ready",
            rarity: "",
            current_time: 0,
            cooldown_hr: 0
        },
        {
            status: "ready",
            rarity: "",
            current_time: 0,
            cooldown_hr: 0
        }
    ])

    const chainId: string        = "f16b1833c747c43682f4386fca9cbb327929334a762755ebec17f6f23c9b8a12"
    const nodeUrl: string        = "https://waxtestnet.greymass.com"

    const api_url: string        = "https://waxtestnet.greymass.com/v1/chain"
    const api_atomic: string     = "https://test.wax.api.atomicassets.io/atomicassets/v1"

    const token_account: string  = "kittentokens"
    const shop_account: string   = "kittymoonshp"
    const game_account: string   = "kittymoonts5"
    const assets_account: string = "atomicassets"

    const collection_name: string   = "kittymoonnft"
    const schema_tools: string      = "tools.kitten"
    const schema_seeds: string      = "seeds.kitten"

    const hoe_pack: number          = 521953
    const watering_can_pack: number = 521954
    const axe_pack: number          = 521956
    const seed_pack: number         = 480016

    const toast = useToast()

    const claim_common: number    = 12
    const claim_uncommon: number  = 13
    const claim_rare: number      = 22
    const claim_legendary: number = 28


    /////////////////////////////
    
    const { isOpen, onOpen, onClose } = useDisclosure()
    const [temp_asset, setTempAsset] = useState<Asset>(null)
    const [temp_seed, setTempSeed] = useState<string>("")

    /////////////////////////////

    const [is_use_tool, setUseToolAndSeed] = useState<boolean>(false)
    const [select_blocks, setSelectBlocks] = useState<Array<boolean>>([false, false, false, false])

    const get_token_data = (session: LinkSession) => {
        axios({
            method: "post",
            url: api_url+"/get_currency_balance",
            headers: {
                "Content-Type": "text/plain"
            },
            data: {
                code: token_account,
                account: session.auth.actor.toString(),
                symbol: "KITTEN"
            }
        })
        .then((v) => {
            const token: string = v.data.length > 0 ? v.data[0].substr(0, v.data[0].indexOf(".")+3) : "0.00"
            console.log(token)
            setToken(token)
        })
    }

    const get_seeds_and_rewards = (session: LinkSession) => {
        axios({
            method: "post",
            url: api_url+"/get_table_rows",
            headers: {
                "Content-Type": "text/plain"
            },
            data: {
                json: true,
                code: game_account,
                table: "seeds",
                scope: game_account,
                lower_bound: session.auth.actor.toString(),
                limit: 1,
                reverse: false,
                show_payer: false
            }
        })
        .then((v) => {
            //console.log(v.data)
            const data = v.data.rows.filter((v) => v.player_account == session.auth.actor.toString())
            //console.log(data)
            console.log(data.length > 0 ? data[0] : "Not found seeds from account")

            if(data.length > 0) {
                setSeedCommon(parseInt(data[0].common))
                setSeedUncommon(parseInt(data[0].uncommon))
                setSeedRare(parseInt(data[0].rare))
                setSeedLegendary(parseInt(data[0].legend))
            } else {
                setSeedCommon(0)
                setSeedUncommon(0)
                setSeedRare(0)
                setSeedLegendary(0)
            }
        })

        axios({
            method: "post",
            url: api_url+"/get_table_rows",
            headers: {
                "Content-Type": "text/plain"
            },
            data: {
                json: true,
                code: game_account,
                table: "rewards",
                scope: game_account,
                lower_bound: session.auth.actor.toString(),
                limit: 1,
                reverse: false,
                show_payer: false
            }
        })
        .then((v) => {
            //console.log(v.data)
            const data = v.data.rows.filter((v) => v.player_account == session.auth.actor.toString())
            //console.log(data)
            console.log(data.length > 0 ? data[0] : "Not found rewards from account")

            if(data.length > 0) {
                setRewardCommon(parseInt(data[0].common))
                setRewardUncommon(parseInt(data[0].uncommon))
                setRewardRare(parseInt(data[0].rare))
                setRewardLegendary(parseInt(data[0].legend))
            } else {
                setRewardCommon(0)
                setRewardUncommon(0)
                setRewardRare(0)
                setRewardLegendary(0)
            }
        })
    }

    const get_land_blocks = (session: LinkSession) => {
        axios({
            method: "post",
            url: api_url+"/get_table_rows",
            headers: {
                "Content-Type": "text/plain"
            },
            data: {
                json: true,
                code: game_account,
                table: "lands",
                scope: game_account,
                lower_bound: session.auth.actor.toString(),
                limit: 1,
                reverse: false,
                show_payer: false
            }
        })
        .then((v) => {
            //console.log(v)
            const data = v.data.rows.filter((v) => v.player_account == session.auth.actor.toString())

            if(data.length > 0) {
                console.log(data[0].lands[0].blocks)

                const blocks = data[0].lands[0].blocks
                const new_land_blocks: Array<Block> = [...land_blocks]

                new_land_blocks[0].status       = blocks[0].status
                new_land_blocks[0].rarity       = blocks[0].rarity
                new_land_blocks[0].current_time = blocks[0].current_time
                new_land_blocks[0].cooldown_hr  = blocks[0].cooldown_hr

                new_land_blocks[1].status       = blocks[1].status
                new_land_blocks[1].rarity       = blocks[1].rarity
                new_land_blocks[1].current_time = blocks[1].current_time
                new_land_blocks[1].cooldown_hr  = blocks[1].cooldown_hr

                new_land_blocks[2].status       = blocks[2].status
                new_land_blocks[2].rarity       = blocks[2].rarity
                new_land_blocks[2].current_time = blocks[2].current_time
                new_land_blocks[2].cooldown_hr  = blocks[2].cooldown_hr

                new_land_blocks[3].status       = blocks[3].status
                new_land_blocks[3].rarity       = blocks[3].rarity
                new_land_blocks[3].current_time = blocks[3].current_time
                new_land_blocks[3].cooldown_hr  = blocks[3].cooldown_hr
            } else {
                console.log("not found land default from account")
            }
        })
    }

    const get_nft_data = (session: LinkSession) => {
        axios({
            method: "get",
            url: api_atomic+"/assets?"
                    +"collection_name="+collection_name+"&"
                    +"owner="+session.auth.actor.toString()+"&"
                    +"page="+1+"&"
                    +"limit="+63+"&"
                    +"&order=asc&sort=asset_id"
        })
        .then((v) => {
            console.log(v.data)

            const nfts = v.data.data.filter((v) =>
                v.schema.schema_name == schema_seeds ||
                v.schema.schema_name == schema_tools
            )

            //nfts.forEach((v) => console.log(v.asset_id))

            let assets: Array<Asset> = new Array<Asset>()

            nfts.forEach((v) => {
                assets.push(
                    {
                        asset_id: v.asset_id,
                        rarity: v.data.rarity,
                        current_time: 0,
                        cooldown_hr: parseInt(v.data.cooldown_hr),
                        energy: v.schema.schema_name == schema_seeds ? 0 : parseInt(v.data.energy),
                        max_energy: v.schema.schema_name == schema_seeds ? 0 : parseInt(v.data.energy),
                        blocks: v.schema.schema_name == schema_seeds ? 0 : parseInt(v.data.blocks),
                        type: v.schema.schema_name == schema_seeds ? "Seed" :
                                v.name.substr(v.name.length - 3)
                    }
                )
            })

            axios({
                method: "post",
                url: api_url+"/get_table_rows",
                headers: {
                    "Content-Type": "text/plain"
                },
                data: {
                    json: true,
                    code: game_account,
                    table: "tools",
                    scope: game_account,
                    lower_bound: session.auth.actor.toString(),
                    limit: 1,
                    reverse: false,
                    show_payer: false
                }
            })
            .then((v) => {
                //console.log(v.data)
                const data = v.data.rows.filter((v) => v.player_account == session.auth.actor.toString())
                //console.log(data)
                console.log(data.length > 0 ? data[0] : "Not found tools staking table from account")

                if(data.length > 0) {
                    const hoes: Array<Asset> = new Array<Asset>()
                    const watering_cans: Array<Asset> = new Array<Asset>()
                    const axes: Array<Asset> = new Array<Asset>()

                    data[0].toolhoes.forEach((v) => {
                        const hoe: Asset = {
                            asset_id: v.asset_id,
                            blocks: v.blocks,
                            current_time: 0,
                            cooldown_hr: v.cooldown_hr,
                            energy: v.energy,
                            max_energy: v.max_energy,
                            rarity: v.rarity,
                            type: "Hoe"
                        }

                        hoes.push(hoe)

                        if(assets.filter((i) => i.asset_id == i.asset_id).length > 0) assets = assets.filter((i) => i.asset_id != v.asset_id)
                    })

                    data[0].toolcans.forEach((v) => {
                        const watering_can: Asset = {
                            asset_id: v.asset_id,
                            blocks: v.blocks,
                            current_time: 0,
                            cooldown_hr: v.cooldown_hr,
                            energy: v.energy,
                            max_energy: v.max_energy,
                            rarity: v.rarity,
                            type: "Can"
                        }

                        watering_cans.push(watering_can)

                        if(assets.filter((i) => i.asset_id == i.asset_id).length > 0) assets = assets.filter((i) => i.asset_id != v.asset_id)
                    })

                    data[0].toolaxes.forEach((v) => {
                        const axe: Asset = {
                            asset_id: v.asset_id,
                            blocks: v.blocks,
                            current_time: 0,
                            cooldown_hr: v.cooldown_hr,
                            energy: v.energy,
                            max_energy: v.max_energy,
                            rarity: v.rarity,
                            type: "Axe"
                        }

                        axes.push(axe)

                        if(assets.filter((i) => i.asset_id == i.asset_id).length > 0) assets = assets.filter((i) => i.asset_id != v.asset_id)
                    })

                    setHoeTools(hoes)
                    setWateringCanTools(watering_cans)
                    setAxeTools(axes)
                } else {
                    setHoeTools([])
                    setWateringCanTools([])
                    setAxeTools([])
                }

                if(!!temp_asset) {
                    if(
                        assets.filter((i) => i.asset_id == temp_asset.asset_id).length == 0 &&
                        hoe_tools.filter((i) => i.asset_id == temp_asset.asset_id).length == 0 &&
                        watering_can_tools.filter((i) => i.asset_id == temp_asset.asset_id).length == 0 &&
                        axe_tools.filter((i) => i.asset_id == temp_asset.asset_id).length == 0
                    ) { assets.push(temp_asset) }

                    setTempAsset(null)
                }

                console.log(assets)
                setAssets(assets)
            })
        })
    }

    const check_game_register = (session: LinkSession) => {
        axios({
            method: "post",
            url: api_url+"/get_table_rows",
            headers: {
                "Content-Type": "text/plain"
            },
            data: {
                json: true,
                code: game_account,
                table: "players",
                scope: game_account,
                lower_bound: session.auth.actor.toString(),
                limit: 1,
                reverse: false,
                show_payer: false
            }
        })
        .then((v) => {
            //console.log(v.data.rows)
            const data: any = v.data.rows.filter((v) => v.player_account == session.auth.actor.toString())
            //console.log(data)
            console.log(data.length > 0 ? data[0] : "this account not signup yet")

            if(data.length == 0) {
                const action = {
                    account: game_account,
                    name: "signup",
                    authorization: [session.auth],
                    data: {
                        player_account: session.auth.actor.toString(),
                        player_name: "Demo name"
                    }
                }

                session.transact({ action })
                .then(({ transaction }) => {
                    console.log("Transaction broadcast! Id: "+transaction.id)

                    toast({
                        title: "Transaction broadcast! Id: "+transaction.id,
                        status: "success",
                        isClosable: true
                    })

                    check_game_register(session)
                    get_land_blocks(session)
                    get_token_data(session)
                    get_nft_data(session)
                })
                .catch((err) => {
                    console.log(err)

                    toast({
                        title: "Error",
                        status: "error",
                        isClosable: true
                    })
                })
            } else {
                setEnergy(data[0].energy)
                setMaxEnergy(data[0].max_energy)

                get_seeds_and_rewards(session)
            }
        })
    }

    const buy_energy = (amount: string) => {
        const action = {
            account: token_account,
            name: "transfer",
            authorization: [session.auth],
            data: {
                from: session.auth.actor.toString(),
                to: shop_account,
                quantity: amount,
                memo: "buy_energy"
            }
        }

        session.transact({ action })
        .then(({ transaction }) => {
            console.log("Transaction broadcast! Id: "+transaction.id)

            toast({
                title: "Transaction broadcast! Id: "+transaction.id,
                status: "success",
                isClosable: true
            })

            check_game_register(session)
            get_land_blocks(session)
            get_token_data(session)
            get_nft_data(session)
        })
        .catch((err) => {
            console.log(err)

            toast({
                title: "Error",
                status: "error",
                isClosable: true
            })
        })
    }

    const buy_energy_tool = (asset_id: string, amount: string) => {
        const action = {
            account: token_account,
            name: "transfer",
            authorization: [session.auth],
            data: {
                from: session.auth.actor.toString(),
                to: shop_account,
                quantity: amount,
                memo: "buy_energy_tool:"+asset_id
            }
        }

        session.transact({ action })
        .then(({ transaction }) => {
            console.log("Transaction broadcast! Id: "+transaction.id)

            toast({
                title: "Transaction broadcast! Id: "+transaction.id,
                status: "success",
                isClosable: true
            })

            check_game_register(session)
            get_land_blocks(session)
            get_token_data(session)
            get_nft_data(session)
        })
        .catch((err) => {
            console.log(err)

            toast({
                title: "Error",
                status: "error",
                isClosable: true
            })
        })
    }

    const buy_product = (product_template_id: number, amount: string) => {
        const action = {
            account: token_account,
            name: "transfer",
            authorization: [session.auth],
            data: {
                from: session.auth.actor.toString(),
                to: shop_account,
                quantity: amount,
                memo: "buy_product:"+product_template_id
            }
        }

        session.transact({ action })
        .then(({ transaction }) => {
            console.log("Transaction broadcast! Id: "+transaction.id)

            toast({
                title: "Transaction broadcast! Id: "+transaction.id,
                status: "success",
                isClosable: true
            })

            check_game_register(session)
            get_land_blocks(session)
            get_token_data(session)
            get_nft_data(session)
        })
        .catch((err) => {
            console.log(err)

            toast({
                title: "Error",
                status: "error",
                isClosable: true
            })
        })
    }

    const stake_nft = (asset_id: string) => {
        const action = {
            account: assets_account,
            name: "transfer",
            authorization: [session.auth],
            data: {
                from: session.auth.actor.toString(),
                to: game_account,
                asset_ids: [asset_id],
                memo: "stake"
            }
        }

        session.transact({ action })
        .then(({ transaction }) => {
            console.log("Transaction broadcast! Id: "+transaction.id)

            toast({
                title: "Transaction broadcast! Id: "+transaction.id,
                status: "success",
                isClosable: true
            })

            check_game_register(session)
            get_land_blocks(session)
            get_token_data(session)
            get_nft_data(session)
        })
        .catch((err) => {
            console.log(err)

            toast({
                title: "Error",
                status: "error",
                isClosable: true
            })
        })
    }

    const unstake_nft = (asset_id: string) => {
        const action = {
            account: game_account,
            name: "unstake",
            authorization: [session.auth],
            data: {
                player_account: session.auth.actor.toString(),
                asset_id: asset_id
            }
        }

        session.transact({ action })
        .then(({ transaction }) => {
            console.log("Transaction broadcast! Id: "+transaction.id)

            toast({
                title: "Transaction broadcast! Id: "+transaction.id,
                status: "success",
                isClosable: true
            })

            check_game_register(session)
            get_land_blocks(session)
            get_token_data(session)
            get_nft_data(session)
        })
        .catch((err) => {
            console.log(err)

            toast({
                title: "Error",
                status: "error",
                isClosable: true
            })
        })
    }

    const use_tool_action = (asset_id: string, blocks: Array<number>, status_action: string) => {
        const action = {
            account: game_account,
            name: status_action,
            authorization: [session.auth],
            data: {
                player_account: session.auth.actor.toString(),
                asset_id: asset_id,
                land_num: 0,
                blocks_index: blocks
            }
        }

        session.transact({ action })
        .then(({ transaction }) => {
            console.log("Transaction broadcast! Id: "+transaction.id)

            toast({
                title: "Transaction broadcast! Id: "+transaction.id,
                status: "success",
                isClosable: true
            })

            check_game_register(session)
            get_land_blocks(session)
            get_token_data(session)
            get_nft_data(session)
            setTempAsset(null)
        })
        .catch((err) => {
            console.log(err)

            toast({
                title: "Error",
                status: "error",
                isClosable: true
            })
        })
    }

    const use_seed_action = (rarity: string, blocks: Array<number>) => {
        const action = {
            account: game_account,
            name: "puttheseed",
            authorization: [session.auth],
            data: {
                player_account: session.auth.actor.toString(),
                rarity: temp_seed,
                land_num: 0,
                blocks_index: blocks
            }
        }

        session.transact({ action })
        .then(({ transaction }) => {
            console.log("Transaction broadcast! Id: "+transaction.id)

            toast({
                title: "Transaction broadcast! Id: "+transaction.id,
                status: "success",
                isClosable: true
            })

            check_game_register(session)
            get_land_blocks(session)
            get_token_data(session)
            get_nft_data(session)
            setTempAsset(null)
        })
        .catch((err) => {
            console.log(err)

            toast({
                title: "Error",
                status: "error",
                isClosable: true
            })
        })

    }

    const sell_all_reward = () => {
        const action = {
            account: game_account,
            name: "sellreward",
            authorization: [session.auth],
            data: {
                player_account: session.auth.actor.toString(),
                common: reward_common,
                uncommon: reward_uncommon,
                rare: reward_rare,
                legendary: reward_legendary
            }
        }

        session.transact({ action })
        .then(({ transaction }) => {
            console.log("Transaction broadcast! Id: "+transaction.id)

            toast({
                title: "Transaction broadcast! Id: "+transaction.id,
                status: "success",
                isClosable: true
            })

            check_game_register(session)
            get_land_blocks(session)
            get_token_data(session)
            get_nft_data(session)
            setTempAsset(null)
        })
        .catch((err) => {
            console.log(err)

            toast({
                title: "Error",
                status: "error",
                isClosable: true
            })
        })

    }

    useEffect(() => {
        const transport: AnchorLinkBrowserTransport = new AnchorLinkBrowserTransport()

        const _link: Link = new Link(
            {
                transport,
                chains: [ { chainId, nodeUrl } ]
            }
        )

        setLink(_link)

        _link.restoreSession("kittymoon")
        .then((v: LinkSession) => {
            const session: LinkSession = v

            if(session) {
                console.log(session.auth.actor.toString(), "has logged in")

                check_game_register(session)
                get_land_blocks(session)
                get_token_data(session)
                get_nft_data(session)

                toast({
                    title: session.auth.actor.toString()+" has logged in",
                    status: "success",
                    isClosable: true
                })
            }

            setSession(session)
        })
    }, [])

    return (
        <Flex
            position="relative"
            w="100vw"
            h="100vh"
            minW="1280px"
            alignItems="center"
            justifyContent="center"
            userSelect="none"
            bgColor="#1a202c"
        >
            <VStack
                w="full"
                h="full"
                spacing="20px"
            >
                <HStack
                    w="1280px"
                    minW="1280px"
                    pt="20px"
                >
                    <Flex
                        w="200px"
                        h="100px"
                        overflow="hidden"
                    >
                        <Image
                            src="/logo.png"
                            w="200px"
                            top="-30px"
                            left="20px"
                            fit="cover"
                        />
                    </Flex>

                    <Spacer />

                    <Flex>
                        <VStack>
                            <Text
                                fontSize="24px"
                                color={ session ? "white" : "gray.500" }
                            >{ session ? session.auth.actor.toString() : "Please login" }</Text>

                            <Button
                                color="white"
                                bgColor="#212733"

                                onClick={ () =>
                                    {
                                        if(!session) {
                                            link.login("kittymoon")
                                            .then((v: LoginResult) => {
                                                const { session } = v
                                                console.log(session.auth.actor.toString(), "has logged in")

                                                check_game_register(session)
                                                get_land_blocks(session)
                                                get_token_data(session)
                                                get_nft_data(session)

                                                setSession(session)

                                                toast({
                                                    title: session.auth.actor.toString()+" has logged in",
                                                    status: "success",
                                                    isClosable: true
                                                })
                                            })
                                        } else {
                                            session.remove()
                                            
                                            setEnergy(0)
                                            setMaxEnergy(0)
                                            setToken("0.00")
                                            setAssets([])

                                            setSession(null)

                                            toast({
                                                title: "Logged out",
                                                status: "info",
                                                isClosable: true
                                            })
                                        }
                                    }
                                }
                            >{ session ? "Logout" : "Login with Anchor" }</Button>
                        </VStack>
                    </Flex>

                    <Spacer />

                    <Flex>
                        <VStack
                            spacing="0px"
                            alignItems="end"
                        >
                            <Text
                                fontSize="24px"
                            >Demo version 1.0.0</Text>

                            <Text
                                fontSize="18px"
                            >Mockup UI</Text>

                            <Text
                                fontSize="12px"
                            >smart contract debug</Text>
                        </VStack>
                    </Flex>
                </HStack>

                <Flex
                    position="relative"
                    w="1280px"
                    h="720px"
                    minW="1280px"
                    minH="720px"
                    bgImage="/game_screen.png"
                >
                    <VStack
                        position="absolute"
                        padding="10px"
                        w="170px"
                        top="35px"
                        left="210px"
                        color="black"
                        border="2px solid"
                        borderColor="white"
                        rounded="5px"
                        alignItems="start"
                        spacing="0px"
                        backdropFilter="blur(5px)"
                    >
                        <Text
                            fontSize="28px"
                            fontWeight="600"
                            textShadow="2px 2px white"
                        >{ energy+"/"+max_energy }</Text>

                        <Text
                            fontSize="28px"
                            fontWeight="600"
                            textShadow="2px 2px white"
                        >{ token }</Text>
                    </VStack>

                    <Button
                        disabled={ (max_energy - energy) / 25 == 0 }
                        position="absolute"
                        h="30px"
                        top="145px"
                        left="200px"
                        color="black"
                        bgColor="yellow"

                        onClick={ () => { buy_energy(((max_energy - energy) / 25)+".00000000 KITTEN") } }
                    >{ "Buy energy "+((max_energy - energy) / 25)+" KITTEN" }</Button>

                    <HStack
                        position="absolute"
                        top="15px"
                        left="400px"
                        px="10px"
                        py="5px"
                        spacing="20px"
                        bgColor="rgba(20, 80, 80, 0.7)"
                        rounded="5px"
                        color="white"
                    >
                        <HStack>
                            <Text
                                fontSize="18px"
                                fontWeight="600"
                                textShadow="2px 2px black"
                            >Rewards:</Text>

                            <HStack
                                spacing="0px"
                            >
                                <Image
                                    src="/tools_and_seeds/reward_common.png"
                                    w="40px"
                                />

                                <Text
                                    fontSize="28px"
                                    fontWeight="600"
                                    textShadow="2px 2px black"
                                >{ reward_common }</Text>
                            </HStack>

                            <HStack
                                spacing="0px"
                            >
                                <Image
                                    src="/tools_and_seeds/reward_uncommon.png"
                                    w="40px"
                                />

                                <Text
                                    fontSize="28px"
                                    fontWeight="600"
                                    textShadow="2px 2px black"
                                >{ reward_uncommon }</Text>
                            </HStack>

                            <HStack
                                spacing="0px"
                            >
                                <Image
                                    src="/tools_and_seeds/reward_rare.png"
                                    w="40px"
                                />

                                <Text
                                    fontSize="28px"
                                    fontWeight="600"
                                    textShadow="2px 2px black"
                                >{ reward_rare }</Text>
                            </HStack>

                            <HStack
                                spacing="0px"
                            >
                                <Image
                                    src="/tools_and_seeds/reward_legendary.png"
                                    w="40px"
                                />

                                <Text
                                    fontSize="28px"
                                    fontWeight="600"
                                    textShadow="2px 2px black"
                                >{ reward_legendary }</Text>
                            </HStack>
                        </HStack>

                        <HStack>
                            <Text
                                fontSize="18px"
                                fontWeight="600"
                                textShadow="2px 2px black"
                            >Seeds:</Text>

                            <HStack
                                spacing="0px"
                            >
                                <Image
                                    src="/tools_and_seeds/seed_common.png"
                                    w="40px"
                                />

                                <Text
                                    fontSize="28px"
                                    fontWeight="600"
                                    textShadow="2px 2px black"
                                >{ seed_common }</Text>
                            </HStack>

                            <HStack
                                spacing="0px"
                            >
                                <Image
                                    src="/tools_and_seeds/seed_uncommon.png"
                                    w="40px"
                                />

                                <Text
                                    fontSize="28px"
                                    fontWeight="600"
                                    textShadow="2px 2px black"
                                >{ seed_uncommon }</Text>
                            </HStack>

                            <HStack
                                spacing="0px"
                            >
                                <Image
                                    src="/tools_and_seeds/seed_rare.png"
                                    w="40px"
                                />

                                <Text
                                    fontSize="28px"
                                    fontWeight="600"
                                    textShadow="2px 2px black"
                                >{ seed_rare }</Text>
                            </HStack>

                            <HStack
                                spacing="0px"
                            >
                                <Image
                                    src="/tools_and_seeds/seed_legendary.png"
                                    w="40px"
                                />

                                <Text
                                    fontSize="28px"
                                    fontWeight="600"
                                    textShadow="2px 2px black"
                                >{ seed_legendary }</Text>
                            </HStack>
                        </HStack>
                    </HStack>

                    <HStack
                        position="absolute"
                        top="75px"
                        left="780px"
                    >
                        <Button
                            h="20px"
                            color="white"
                            bgColor="black"
                            fontSize="12px"
                            fontWeight="800"

                            onClick={ () =>
                                {
                                    setUseToolAndSeed(true)
                                    setTempSeed("common")
                                    setTempAsset(null)
                                    onClose()
                                }
                            }
                        >USE (C)</Button>

                        <Button
                            h="20px"
                            color="skyblue"
                            bgColor="black"
                            fontSize="12px"
                            fontWeight="800"

                            onClick={ () =>
                                {
                                    setUseToolAndSeed(true)
                                    setTempSeed("uncommon")
                                    setTempAsset(null)
                                    onClose()
                                }
                            }
                        >USE (U)</Button>

                        <Button
                            h="20px"
                            color="violet"
                            bgColor="black"
                            fontSize="12px"
                            fontWeight="800"

                            onClick={ () =>
                                {
                                    setUseToolAndSeed(true)
                                    setTempSeed("rare")
                                    setTempAsset(null)
                                    onClose()
                                }
                            }
                        >USE (R)</Button>

                        <Button
                            h="20px"
                            color="yellow"
                            bgColor="black"
                            fontSize="12px"
                            fontWeight="800"

                            onClick={ () =>
                                {
                                    setUseToolAndSeed(true)
                                    setTempSeed("legendary")
                                    setTempAsset(null)
                                    onClose()
                                }
                            }
                        >USE (L)</Button>
                    </HStack>

                    <Flex
                        position="absolute"
                        w="170px"
                        h="25px"
                        top="310px"
                        left="485px"
                        bgColor="black"
                        roundedBottom="5px"
                    />

                    <Button
                        disabled={ reward_common + reward_uncommon + reward_rare + reward_legendary == 0 }
                        position="absolute"
                        w="170px"
                        h="30px"
                        top="95px"
                        left="485px"
                        bgColor="green"

                        onClick={ sell_all_reward }
                    >Sell all reward</Button>

                    <VStack
                        position="absolute"
                        w="170px"
                        h="180px"
                        px="10px"
                        py="10px"
                        top="130px"
                        left="485px"
                        border="2px solid"
                        borderColor="white"
                        bgColor="rgba(0, 0, 0, 0.5)"
                        rounded="5px"
                        spacing="0px"
                    >
                        <HStack
                            w="full"
                        >
                            <Image
                                src="/tools_and_seeds/reward_common.png"
                                w="40px"
                                h="40px"
                            />
                            
                            <Text
                                fontSize="24px"
                                fontWeight="600"
                                textShadow="2px 2px black"
                                color="white"
                            >{ reward_common * claim_common }</Text>

                            <Spacer />

                            {/*
                            <Text
                                fontSize="24px"
                                fontWeight="600"
                                color="rgb(100, 255, 100)"
                                textShadow="2px 2px black"
                            >+50</Text>
                            */}
                        </HStack>

                        <HStack
                            w="full"
                        >
                            <Image
                                src="/tools_and_seeds/reward_uncommon.png"
                                w="40px"
                                h="40px"
                            />
                            
                            <Text
                                fontSize="24px"
                                fontWeight="600"
                                textShadow="2px 2px black"
                                color="white"
                            >{ reward_uncommon * claim_uncommon }</Text>

                            <Spacer />

                            {/*
                            <Text
                                fontSize="24px"
                                fontWeight="600"
                                color="rgb(255, 100, 100)"
                                textShadow="2px 2px black"
                            >-50</Text>
                            */}
                        </HStack>

                        <HStack
                            w="full"
                        >
                            <Image
                                src="/tools_and_seeds/reward_rare.png"
                                w="40px"
                                h="40px"
                            />
                            
                            <Text
                                fontSize="24px"
                                fontWeight="600"
                                textShadow="2px 2px black"
                                color="white"
                            >{ reward_rare * claim_rare }</Text>
                        </HStack>

                        <HStack
                            w="full"
                        >
                            <Image
                                src="/tools_and_seeds/reward_legendary.png"
                                w="40px"
                                h="40px"
                            />
                            
                            <Text
                                fontSize="24px"
                                fontWeight="600"
                                textShadow="2px 2px black"
                                color="white"
                            >{ reward_legendary * claim_legendary }</Text>
                        </HStack>

                        <Text
                            w="full"
                            pl="24px"
                            fontSize="24px"
                            fontWeight="600"
                            textShadow="2px 2px black"
                            color="greenyellow"
                        >{ "= "+((reward_common * claim_common)+(reward_uncommon * claim_uncommon)+(reward_rare * claim_rare)+(reward_legendary * claim_legendary)) }</Text>
                    </VStack>

                    <VStack
                        position="absolute"
                        w="162px"
                        top="190px"
                        left="125px"
                        padding="5px"
                        spacing="25px"
                        alignItems="start"
                        border="2px solid"
                        borderColor="white"
                        rounded="5px"
                        backdropFilter="blur(5px)"
                    >
                        <HStack
                            h="70px"
                        >
                            <Tooltip
                                hasArrow
                                placement="top"
                                label={ "id: "+(hoe_tools.length > 0 ? hoe_tools[0].asset_id : "") }
                                bgColor="black"
                                color="white"
                            >
                                <Flex
                                    hidden={ hoe_tools.length < 1 }
                                    position="relative"
                                    { ...on_hand_style }

                                    bgImage={
                                        hoe_tools.length > 0 ?
                                            "/tools_and_seeds/"+((hoe_tools[0].type+"_"+hoe_tools[0].rarity).toLocaleLowerCase())+".png" :
                                            ""
                                    }

                                    bgSize="contain"

                                    onClick={ () =>
                                        {
                                            if(hoe_tools.length > 0) {
                                                setTempAsset(hoe_tools[0])
                                                onOpen()
                                            }
                                        }
                                    }
                                >
                                    <Flex
                                        position="absolute"
                                        w="full"
                                        h="6px"
                                        bottom="0px"
                                        bgColor="black"
                                        overflow="hidden"
                                    >
                                        <Flex
                                            position="absolute"
                                            w={ hoe_tools.length > 0 ? (hoe_tools[0].energy / hoe_tools[0].max_energy * 100)+"%" : "0%" }
                                            h="6px"
                                            top="0px"
                                            left="0px"
                                            bgColor="white"
                                        />
                                    </Flex>
                                </Flex>
                            </Tooltip>

                            <Tooltip
                                hasArrow
                                placement="top"
                                label={ "id: "+(hoe_tools.length > 1 ? hoe_tools[1].asset_id : "") }
                                bgColor="black"
                                color="white"
                            >
                                <Flex
                                    hidden={ hoe_tools.length < 2 }
                                    position="relative"
                                    { ...on_hand_style }

                                    bgImage={
                                        hoe_tools.length > 1 ?
                                            "/tools_and_seeds/"+((hoe_tools[1].type+"_"+hoe_tools[1].rarity).toLocaleLowerCase())+".png" :
                                            ""
                                    }

                                    bgSize="contain"

                                    onClick={ () =>
                                        {
                                            if(hoe_tools.length > 1) {
                                                setTempAsset(hoe_tools[1])
                                                onOpen()
                                            }
                                        }
                                    }
                                >
                                    <Flex
                                        position="absolute"
                                        w="full"
                                        h="6px"
                                        bottom="0px"
                                        bgColor="black"
                                        overflow="hidden"
                                    >
                                        <Flex
                                            position="absolute"
                                            w={ hoe_tools.length > 1 ? (hoe_tools[1].energy / hoe_tools[1].max_energy * 100)+"%" : "0%" }
                                            h="6px"
                                            top="0px"
                                            left="0px"
                                            bgColor="white"
                                        />
                                    </Flex>
                                </Flex>
                            </Tooltip>
                        </HStack>

                        <HStack
                            h="70px"
                        >
                            <Tooltip
                                hasArrow
                                placement="top"
                                label={ "id: "+(watering_can_tools.length > 0 ? watering_can_tools[0].asset_id : "") }
                                bgColor="black"
                                color="white"
                            >
                                <Flex
                                    hidden={ watering_can_tools.length < 1 }
                                    position="relative"
                                    { ...on_hand_style }

                                    bgImage={
                                        watering_can_tools.length > 0 ?
                                            "/tools_and_seeds/"+((watering_can_tools[0].type+"_"+watering_can_tools[0].rarity).toLocaleLowerCase())+".png" :
                                            ""
                                    }

                                    bgSize="contain"

                                    onClick={ () =>
                                        {
                                            if(watering_can_tools.length > 0) {
                                                setTempAsset(watering_can_tools[0])
                                                onOpen()
                                            }
                                        }
                                    }
                                >
                                    <Flex
                                        position="absolute"
                                        w="full"
                                        h="6px"
                                        bottom="0px"
                                        bgColor="black"
                                        overflow="hidden"
                                    >
                                        <Flex
                                            position="absolute"
                                            w={ watering_can_tools.length > 0 ? (watering_can_tools[0].energy / watering_can_tools[0].max_energy * 100)+"%" : "0%" }
                                            h="6px"
                                            top="0px"
                                            left="0px"
                                            bgColor="white"
                                        />
                                    </Flex>
                                </Flex>
                            </Tooltip>

                            <Tooltip
                                hasArrow
                                placement="top"
                                label={ "id: "+(watering_can_tools.length > 1 ? watering_can_tools[1].asset_id : "") }
                                bgColor="black"
                                color="white"
                            >
                                <Flex
                                    hidden={ watering_can_tools.length < 2 }
                                    position="relative"
                                    { ...on_hand_style }

                                    bgImage={
                                        watering_can_tools.length > 1 ?
                                            "/tools_and_seeds/"+((watering_can_tools[1].type+"_"+watering_can_tools[1].rarity).toLocaleLowerCase())+".png" :
                                            ""
                                    }

                                    bgSize="contain"

                                    onClick={ () =>
                                        {
                                            if(watering_can_tools.length > 1) {
                                                setTempAsset(watering_can_tools[1])
                                                onOpen()
                                            }
                                        }
                                    }
                                >
                                    <Flex
                                        position="absolute"
                                        w="full"
                                        h="6px"
                                        bottom="0px"
                                        bgColor="black"
                                        overflow="hidden"
                                    >
                                        <Flex
                                            position="absolute"
                                            w={ watering_can_tools.length > 1 ? (watering_can_tools[1].energy / watering_can_tools[1].max_energy * 100)+"%" : "0%" }
                                            h="6px"
                                            top="0px"
                                            left="0px"
                                            bgColor="white"
                                        />
                                    </Flex>
                                </Flex>
                            </Tooltip>
                        </HStack>

                        <HStack
                            h="70px"
                        >
                            <Tooltip
                                hasArrow
                                placement="top"
                                label={ "id: "+(axe_tools.length > 0 ? axe_tools[0].asset_id : "") }
                                bgColor="black"
                                color="white"
                            >
                                <Flex
                                    hidden={ axe_tools.length < 1 }
                                    position="relative"
                                    { ...on_hand_style }

                                    bgImage={
                                        axe_tools.length > 0 ?
                                            "/tools_and_seeds/"+((axe_tools[0].type+"_"+axe_tools[0].rarity).toLocaleLowerCase())+".png" :
                                            ""
                                    }

                                    bgSize="contain"

                                    onClick={ () =>
                                        {
                                            if(axe_tools.length > 0) {
                                                setTempAsset(axe_tools[0])
                                                onOpen()
                                            }
                                        }
                                    }
                                >
                                    <Flex
                                        position="absolute"
                                        w="full"
                                        h="6px"
                                        bottom="0px"
                                        bgColor="black"
                                        overflow="hidden"
                                    >
                                        <Flex
                                            position="absolute"
                                            w={ axe_tools.length > 0 ? (axe_tools[0].energy / axe_tools[0].max_energy * 100)+"%" : "0%" }
                                            h="6px"
                                            top="0px"
                                            left="0px"
                                            bgColor="white"
                                        />
                                    </Flex>
                                </Flex>
                            </Tooltip>

                            <Tooltip
                                hasArrow
                                placement="top"
                                label={ "id: "+(axe_tools.length > 1 ? axe_tools[1].asset_id : "") }
                                bgColor="black"
                                color="white"
                            >
                                <Flex
                                    hidden={ axe_tools.length < 2 }
                                    position="relative"
                                    { ...on_hand_style }

                                    bgImage={
                                        axe_tools.length > 1 ?
                                            "/tools_and_seeds/"+((axe_tools[1].type+"_"+axe_tools[1].rarity).toLocaleLowerCase())+".png" :
                                            ""
                                    }

                                    bgSize="contain"

                                    onClick={ () =>
                                        {
                                            if(axe_tools.length > 1) {
                                                setTempAsset(axe_tools[1])
                                                onOpen()
                                            }
                                        }
                                    }
                                >
                                    <Flex
                                        position="absolute"
                                        w="full"
                                        h="6px"
                                        bottom="0px"
                                        bgColor="black"
                                        overflow="hidden"
                                    >
                                        <Flex
                                            position="absolute"
                                            w={ axe_tools.length > 1 ? (axe_tools[1].energy / axe_tools[1].max_energy * 100)+"%" : "0%" }
                                            h="6px"
                                            top="0px"
                                            left="0px"
                                            bgColor="white"
                                        />
                                    </Flex>
                                </Flex>
                            </Tooltip>
                        </HStack>
                    </VStack>

                    <VStack
                        position="absolute"
                        top="385px"
                        left="610px"
                        spacing="5px"
                    >
                        <HStack
                            spacing="5px"
                        >
                            <Flex
                                { ...block_style }

                                border={ !select_blocks[0] ? "2px solid" : "4px solid" }
                                borderColor={ !select_blocks[0] ? block_style.borderColor : "rgb(100, 255, 100)" }

                                bgColor={
                                    land_blocks[0].status == "ready" ?
                                        "" :
                                        land_blocks[0].status == "prepared" || land_blocks[0].status == "watering" ?
                                            "#d4a06c" :
                                            land_blocks[0].status == "harvesting" ?
                                                "#6cc8d4" : ""

                                }

                                onClick={ () =>
                                    {
                                        if(is_use_tool) {
                                            if(temp_asset) {
                                                const new_select_blocks: Array<boolean> = [...select_blocks]
                                                const selected_count: number = new_select_blocks.filter((i) => i).length

                                                if(!new_select_blocks[0]) new_select_blocks[0] = selected_count < temp_asset.blocks ? true : false
                                                else new_select_blocks[0] = false

                                                setSelectBlocks(new_select_blocks)
                                            }
                                            else if(temp_seed != "") {
                                                const new_select_blocks: Array<boolean> = [...select_blocks]
                                                const selected_count: number = new_select_blocks.filter((i) => i).length

                                                const seed_count: number =
                                                    temp_seed == "common" ?
                                                        seed_common :
                                                        temp_seed == "uncommon" ?
                                                            seed_uncommon :
                                                            temp_seed == "rare" ?
                                                                seed_rare : seed_legendary

                                                if(!new_select_blocks[0]) new_select_blocks[0] = selected_count < seed_count ? true : false
                                                else new_select_blocks[0] = false

                                                setSelectBlocks(new_select_blocks)
                                            }
                                        }
                                    }
                                }
                            ></Flex>

                            <Flex
                                { ...block_style }

                                border={ !select_blocks[1] ? "2px solid" : "4px solid" }
                                borderColor={ !select_blocks[1] ? block_style.borderColor : "rgb(100, 255, 100)" }

                                bgColor={
                                    land_blocks[1].status == "ready" ?
                                        "" :
                                        land_blocks[1].status == "prepared" || land_blocks[1].status == "watering" ?
                                            "#d4a06c" :
                                            land_blocks[1].status == "harvesting" ?
                                                "#6cc8d4" : ""

                                }

                                onClick={ () =>
                                    {
                                        if(is_use_tool) {
                                            if(temp_asset) {
                                                const new_select_blocks: Array<boolean> = [...select_blocks]
                                                const selected_count: number = new_select_blocks.filter((i) => i).length

                                                if(!new_select_blocks[1]) new_select_blocks[1] = selected_count < temp_asset.blocks ? true : false
                                                else new_select_blocks[1] = false

                                                setSelectBlocks(new_select_blocks)
                                            }
                                            else if(temp_seed != "") {
                                                const new_select_blocks: Array<boolean> = [...select_blocks]
                                                const selected_count: number = new_select_blocks.filter((i) => i).length

                                                const seed_count: number =
                                                    temp_seed == "common" ?
                                                        seed_common :
                                                        temp_seed == "uncommon" ?
                                                            seed_uncommon :
                                                            temp_seed == "rare" ?
                                                                seed_rare : seed_legendary

                                                if(!new_select_blocks[1]) new_select_blocks[1] = selected_count < seed_count ? true : false
                                                else new_select_blocks[1] = false

                                                setSelectBlocks(new_select_blocks)
                                            }
                                        }
                                    }
                                }
                            ></Flex>
                        </HStack>

                        <HStack
                            spacing="5px"
                        >
                            <Flex
                                { ...block_style }

                                border={ !select_blocks[2] ? "2px solid" : "4px solid" }
                                borderColor={ !select_blocks[2] ? block_style.borderColor : "rgb(100, 255, 100)" }

                                bgColor={
                                    land_blocks[2].status == "ready" ?
                                        "" :
                                        land_blocks[2].status == "prepared" || land_blocks[2].status == "watering" ?
                                            "#d4a06c" :
                                            land_blocks[2].status == "harvesting" ?
                                                "#6cc8d4" : ""

                                }

                                onClick={ () =>
                                    {
                                        if(is_use_tool) {
                                            if(temp_asset) {
                                                const new_select_blocks: Array<boolean> = [...select_blocks]
                                                const selected_count: number = new_select_blocks.filter((i) => i).length

                                                if(!new_select_blocks[2]) new_select_blocks[2] = selected_count < temp_asset.blocks ? true : false
                                                else new_select_blocks[2] = false

                                                setSelectBlocks(new_select_blocks)
                                            }
                                            else if(temp_seed != "") {
                                                const new_select_blocks: Array<boolean> = [...select_blocks]
                                                const selected_count: number = new_select_blocks.filter((i) => i).length

                                                const seed_count: number =
                                                    temp_seed == "common" ?
                                                        seed_common :
                                                        temp_seed == "uncommon" ?
                                                            seed_uncommon :
                                                            temp_seed == "rare" ?
                                                                seed_rare : seed_legendary

                                                if(!new_select_blocks[2]) new_select_blocks[2] = selected_count < seed_count ? true : false
                                                else new_select_blocks[2] = false

                                                setSelectBlocks(new_select_blocks)
                                            }
                                        }
                                    }
                                }
                            ></Flex>

                            <Flex
                                { ...block_style }

                                border={ !select_blocks[3] ? "2px solid" : "4px solid" }
                                borderColor={ !select_blocks[3] ? block_style.borderColor : "rgb(100, 255, 100)" }

                                bgColor={
                                    land_blocks[3].status == "ready" ?
                                        "" :
                                        land_blocks[3].status == "prepared" || land_blocks[3].status == "watering" ?
                                            "#d4a06c" :
                                            land_blocks[3].status == "harvesting" ?
                                                "#6cc8d4" : ""

                                }

                                onClick={ () =>
                                    {
                                        if(is_use_tool) {
                                            if(temp_asset) {
                                                const new_select_blocks: Array<boolean> = [...select_blocks]
                                                const selected_count: number = new_select_blocks.filter((i) => i).length

                                                if(!new_select_blocks[3]) new_select_blocks[3] = selected_count < temp_asset.blocks ? true : false
                                                else new_select_blocks[3] = false

                                                setSelectBlocks(new_select_blocks)
                                            }
                                            else if(temp_seed != "") {
                                                const new_select_blocks: Array<boolean> = [...select_blocks]
                                                const selected_count: number = new_select_blocks.filter((i) => i).length

                                                const seed_count: number =
                                                    temp_seed == "common" ?
                                                        seed_common :
                                                        temp_seed == "uncommon" ?
                                                            seed_uncommon :
                                                            temp_seed == "rare" ?
                                                                seed_rare : seed_legendary

                                                if(!new_select_blocks[3]) new_select_blocks[3] = selected_count < seed_count ? true : false
                                                else new_select_blocks[3] = false

                                                setSelectBlocks(new_select_blocks)
                                            }
                                        }
                                    }
                                }
                            ></Flex>
                        </HStack>
                    </VStack>

                    <Flex
                        position="absolute"
                        flexWrap="wrap"
                        gap="5px"
                        w="400px"
                        h="550px"
                        padding="5px"
                        top="100px"
                        right="20px"
                        border="2px solid"
                        borderColor="white"
                        rounded="5px"
                        backdropFilter="blur(5px)"
                        alignItems="flex-start"
                        alignContent="flex-start"
                        justifyContent="flex-start"
                        color="white"
                    >
                        <Button
                            position="absolute"
                            bottom="5px"
                            left="150px"
                            bgColor="rgb(40, 80, 80)"

                            onClick={ () => 
                                {
                                    get_nft_data(session)
                                }
                            }
                        >Refresh</Button>

                        <Text
                            position="absolute"
                            w="full"
                            bottom="-30px"
                            textAlign="center"
                            bgColor="black"
                            rounded="5px"
                        >If assets not updated you can click to refresh</Text>

                        {
                            assets.map((v, i) => (
                                <Tooltip
                                    key={ i }
                                    hasArrow
                                    placement="top"
                                    label={ "id: "+v.asset_id }
                                    bgColor="black"
                                    color="white"
                                >
                                    <Flex
                                        w="50px"
                                        h="50px"
                                        border="2px solid"
                                        borderColor="white"

                                        bgImage={
                                            "/tools_and_seeds/"+
                                                (
                                                    v.type == "Seed" ? 
                                                        "seed_"+v.rarity.toLowerCase() :
                                                            (v.type+"_"+v.rarity).toLocaleLowerCase()
                                                )
                                                +".png"
                                        }

                                        bgSize="contain"
                                        rounded="5px"
                                        cursor="pointer"

                                        onClick={ () =>
                                            {
                                                stake_nft(v.asset_id)
                                            }
                                        }
                                    />
                                </Tooltip>
                            ))
                        }
                    </Flex>

                    <Flex
                        hidden={ !is_use_tool }
                        position="absolute"
                        w="full"
                        h="340px"
                        top="0px"
                        left="0px"
                        bgColor="rgba(0, 0, 0, 0.6)"
                    />

                    <Flex
                        hidden={ !is_use_tool }
                        position="absolute"
                        w="full"
                        h="200px"
                        bottom="0px"
                        left="0px"
                        bgColor="rgba(0, 0, 0, 0.6)"
                    />

                    <Flex
                        hidden={ !is_use_tool }
                        position="absolute"
                        w="560px"
                        h="180px"
                        top="340px"
                        left="0px"
                        bgColor="rgba(0, 0, 0, 0.6)"
                    />

                    <Flex
                        hidden={ !is_use_tool }
                        position="absolute"
                        w="510px"
                        h="180px"
                        top="340px"
                        left="770px"
                        bgColor="rgba(0, 0, 0, 0.6)"
                    />

                    <Button
                        hidden={ !is_use_tool }
                        position="absolute"
                        w="210px"
                        h="40px"
                        top="295px"
                        left="560px"
                        color="white"
                        bgColor="rgb(10, 200, 10)"

                        onClick={ () =>
                            {
                                const result: Array<number> = new Array<number>()

                                for(let i: number = 0; i < 4; i++) {
                                    if(select_blocks[i]) result.push(i)
                                }

                                if(!!temp_asset) {
                                    const status_action: string =
                                        temp_asset.type == "Hoe" ?
                                            "preparing" :
                                            temp_asset.type == "Can" ?
                                                "watering" :
                                                temp_asset.type == "Axe" ?
                                                    "harvesting" : "Seed"

                                    if(status_action != "Seed") use_tool_action(temp_asset.asset_id, result, status_action)
                                } else { use_seed_action(temp_seed, result) }

                                setUseToolAndSeed(false)
                                setSelectBlocks([false, false, false, false])
                                onClose()
                            }
                        }
                    >Accept</Button>

                    <Button
                        hidden={ !is_use_tool }
                        position="absolute"
                        w="210px"
                        h="40px"
                        top="525px"
                        left="560px"
                        color="white"
                        bgColor="red"

                        onClick={ () =>
                            {
                                setUseToolAndSeed(false)
                                setTempSeed("")
                                setSelectBlocks([false, false, false, false])
                            }
                        }
                    >Cancel</Button>
                </Flex>

                <HStack>
                    <Button
                        disabled={ !session }
                        color="white"
                        bgColor="#212733"
                        onClick={ () => { if(session) { buy_product(hoe_pack, "70.00000000 KITTEN") } } }
                    >Buy hoe pack 70 KITTEN</Button>

                    <Button
                        disabled={ !session }
                        color="white"
                        bgColor="#212733"
                        onClick={ () => { if(session) { buy_product(watering_can_pack, "70.00000000 KITTEN") } } }
                    >Buy watering can pack 70 KITTEN</Button>

                    <Button
                        disabled={ !session }
                        color="white"
                        bgColor="#212733"
                        onClick={ () => { if(session) { buy_product(axe_pack, "70.00000000 KITTEN") } } }
                    >Buy axe pack 70 KITTEN</Button>

                    <Button
                        disabled={ !session }
                        color="white"
                        bgColor="#212733"
                        onClick={ () => { if(session) buy_product(seed_pack, "10.00000000 KITTEN") } }
                    >Buy seed pack 10 KITTEN</Button>
                </HStack>
            </VStack>

            <Modal
                isOpen={ isOpen}
                onClose={ () =>
                    {
                        onClose()
                        setTempAsset(null)
                    }
                }
                isCentered
            >
                <ModalOverlay />

                <ModalContent
                    bgColor="black"
                >
                    <ModalBody>
                        <Flex
                            w="full"
                            pt="10px"
                            alignItems="center"
                            justifyContent="center"
                            color="white"
                        >
                            <HStack>
                                <Text>{ !!temp_asset ? "id: "+temp_asset.asset_id : "" }</Text>
                                <Text>{ !!temp_asset ? "energy: "+temp_asset.energy+"/"+temp_asset.max_energy : "" }</Text>
                            </HStack>
                        </Flex>
                    </ModalBody>

                    <ModalFooter>
                        <Flex
                            w="full"
                            alignItems="center"
                            justifyContent="center"
                            color="white"
                        >
                            <HStack>
                                <Button
                                    bgColor="blue"

                                    onClick={ () =>
                                        {
                                            setUseToolAndSeed(true)
                                            onClose()
                                        }
                                    }
                                >Use tool</Button>

                                <Button
                                    disabled={ !!temp_asset ? ((temp_asset.max_energy - temp_asset.energy) / 25) == 0 ? true : false : true }
                                    bgColor="green"

                                    onClick={ () =>
                                        {
                                            buy_energy_tool(temp_asset.asset_id, ((temp_asset.max_energy - temp_asset.energy) / 25)+".00000000 KITTEN")
                                            onClose()
                                            setTempAsset(null)
                                        }
                                    }
                                >{ "Buy tool energy "+(!!temp_asset ? ((temp_asset.max_energy - temp_asset.energy) / 25) : "0")+" KITTEN" }</Button>

                                <Button
                                    bgColor="red"

                                    onClick={ () =>
                                        {
                                            unstake_nft(temp_asset.asset_id)
                                            onClose()
                                            setTempAsset(null)
                                        }
                                    }
                                >Unstake</Button>
                            </HStack>
                        </Flex>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Flex>
    )
}

export default Index