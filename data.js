// ============================================================================
// ゲームデータ設定
// ============================================================================

const SCENES = {
  washitsu: {
    id: 'washitsu',
    title: '和室 (現場)',
    description: '凄惨な現場だ。畳には生々しい血痕が残り、鑑識の番号札が置かれている。',
    monologue: '……これは酷い。被害者はここで息絶えた。手がかりを探さなければ。',
    bg: 'bg_crime_scene_washitsu.png',
    spots: [
      { id: 'blood', label: '血痕', top: '70%', left: '30%', width: '30%', height: '20%', discovery: 'まだ新しい。被害者はここで息絶えたようだ。', important: true },
      { id: 'tag1', label: '番号札1', top: '75%', left: '15%', width: '10%', height: '10%', discovery: 'ルミノール反応があった場所だ。' },
      { id: 'scroll', label: '掛け軸', top: '15%', left: '68%', width: '15%', height: '30%', discovery: '立派な山水画だ。わずかに傾いている気がする。', item: 'defaced_photo' },
      { id: 'teacup', label: '茶碗', top: '60%', left: '60%', width: '10%', height: '10%', discovery: '茶碗が2つある。被害者は昨夜、誰かと向かい合っていた。', important: true },
      { id: 'washitsu_window', label: '窓', top: '20%', left: '5%', width: '15%', height: '30%', discovery: '窓枠が丁寧に拭き取られている。指紋を消した跡か。', important: true },
      { id: 'desk_game', label: '文机', top: '55%', left: '5%', width: '20%', height: '20%', discovery: '将棋の駒が散らばっている。対局の途中で席を立ったようだ。' },
      { id: 'flower', label: '床の間の花', top: '20%', left: '40%', width: '15%', height: '25%', discovery: '造花だ。ホコリをかぶっている。飾りとしても機能していなかったようだ。' }
    ],
    persons: ['police'],
    exits: ['corridor']
  },
  corridor: {
    id: 'corridor',
    title: '廊下',
    description: '薄暗い廊下に一匹の猫がいる。じっとこちらを見ている。',
    monologue: 'この屋敷には、まだ隠れたものがある気がする……猫は何かを知っているのだろうか。',
    bg: 'bg_hallway.png',
    spots: [
      { id: 'cat', label: '猫', top: '60%', left: '45%', width: '10%', height: '10%', discovery: '猫はゆっくりと書斎の方へ向かっていった。', triggerEvent: 'cat_move' },
      { id: 'hidden_door', label: '壁の継ぎ目', top: '40%', left: '80%', width: '15%', height: '40%', discovery: '壁の一部が扉になっている。地下へ続いているようだ。', condition: 'found_cat', conditionMessage: '特に変わったところはない。' },
      { id: 'clock', label: '柱時計', top: '10%', left: '5%', width: '15%', height: '50%', discovery: '時計が止まっている——昨夜11時34分。何かの衝撃で止まったのか。', important: true },
      { id: 'floor_scratch', label: '床の傷', top: '80%', left: '20%', width: '30%', height: '15%', discovery: '重いものを引きずったような傷がついている。最近ついたものだ。', important: true },
      { id: 'hallway_painting', label: '廊下の絵', top: '15%', left: '50%', width: '20%', height: '35%', discovery: '海の風景画だ。裏を見たが何もない。特に変わったところはなさそうだ。' }
    ],
    persons: [],
    exits: ['washitsu', 'entrance', 'study', 'catacombs']
  },
  entrance: {
    id: 'entrance',
    title: '玄関ホール',
    description: '豪華なシャンデリアが印象的な玄関だ。だが、今は出口が封鎖されている。',
    monologue: '逃げ道はない……いや、犯人もそうだったはずだ。この部屋にも何かある。',
    bg: 'bg_entrance.png',
    spots: [
      { id: 'chandelier', label: 'シャンデリア', top: '5%', left: '35%', width: '30%', height: '30%', discovery: '豪華なシャンデリアだ。埃が積もっている。最近は手入れされていないようだ。' },
      { id: 'front_door', label: '正面扉', top: '20%', left: '70%', width: '25%', height: '60%', discovery: '厳重に施錠されている。外からも内からも開かない。', important: true },
      { id: 'visitor_log', label: '来客記録', top: '50%', left: '5%', width: '20%', height: '30%', discovery: '昨夜の来客欄——一行だけ空白になっている。メイドの字で「――」とだけ書かれている。', important: true },
      { id: 'coat_rack', label: 'コート掛け', top: '30%', left: '0%', width: '15%', height: '50%', discovery: '主のコートが掛かったままだ。ポケットに何もない。' },
      { id: 'telephone', label: '電話機', top: '55%', left: '60%', width: '15%', height: '15%', discovery: '黒い受話器がわずかにずれている。最後に誰かと話したのはいつだろうか。' },
      { id: 'umbrella_stand', label: '傘立て', top: '40%', left: '85%', width: '10%', height: '40%', discovery: '傘が3本。外は晴れているのに、1本だけ濡れている。誰が雨の中を来た？', important: true }
    ],
    persons: ['maid'],
    exits: ['corridor']
  },
  study: {
    id: 'study',
    title: '書斎',
    description: '主の書斎だ。誰かが探し回ったような形跡がある。本棚が壁一面を覆っている。',
    monologue: '主人が最後に過ごした場所……何かが隠されている。徹底的に調べよう。',
    bg: 'bg_study.png',
    spots: [
      { id: 'desk', label: '机', top: '65%', left: '30%', width: '40%', height: '20%', discovery: '引き出しに封筒が押し込まれていた。慌てて隠したのだろうか。', item: 'old_letter' },
      { id: 'portrait', label: '肖像画', top: '20%', left: '50%', width: '15%', height: '25%', discovery: '屋敷の主だ。若い頃の絵か。何かを知っているような目をしている。裏を見ると文字が刻まれていた——「1952」', important: true },
      { id: 'bookshelf', label: '本棚', top: '10%', left: '0%', width: '20%', height: '75%', discovery: '一冊だけ、何度も読み直された跡のある本がある。ページの端が折られている。' },
      { id: 'switch', label: '本棚の奥', top: '30%', left: '10%', width: '10%', height: '20%', discovery: '本棚の奥に隠されたスイッチがあった。重い音がして、どこかのロックが外れた。', important: true, triggerEvent: 'unlock_basement' },
      { id: 'window', label: '窓', top: '20%', left: '70%', width: '20%', height: '30%', discovery: 'ちょうど和室が見える位置だ。主はここから——何かを見ていたのだろうか。' },
      { id: 'fireplace', label: '暖炉', top: '50%', left: '75%', width: '20%', height: '35%', discovery: '灰の中に紙を燃やした跡がある。完全には燃えておらず、わずかに文字が読める——「……だけは、絶対に」', important: true },
      { id: 'brandy', label: 'グラス', top: '60%', left: '70%', width: '10%', height: '10%', discovery: 'ブランデーグラスが2つ出ている。昨夜、誰かとここで向かい合っていた。', important: true },
      { id: 'globe', label: '地球儀', top: '40%', left: '55%', width: '12%', height: '20%', discovery: '古い地球儀だ。南米のある地点に小さな印がついている。何を意味するのか……' }
    ],
    persons: [],
    exits: ['corridor']
  },
  catacombs: {
    id: 'catacombs',
    title: '古いカタコンベ',
    description: 'ひんやりとした空気が漂う。中央に小さな祭壇がある。',
    monologue: '冷たい空気が全身に纏わりつく……ここには長い時間が眠っている。',
    bg: 'Underground_catacomb_corridor_in_detailed_pixel_ar-1770439341062.png',
    spots: [
      { id: 'cross', label: '祭壇', top: '50%', left: '45%', width: '10%', height: '20%', discovery: '小さな十字架を見つけた。', item: 'cross_key' },
      { id: 'wall_carving', label: '壁の文字', top: '30%', left: '10%', width: '20%', height: '30%', discovery: '石壁に荒々しく刻まれた文字——「ゆるさない」。いつ、誰が？', important: true },
      { id: 'candle', label: '燭台', top: '20%', left: '75%', width: '10%', height: '30%', discovery: '蝋燭の跡がある。まだ蝋が柔らかい——最近ここに誰かがいた。' },
      { id: 'old_graves', label: '古い墓碑', top: '50%', left: '0%', width: '15%', height: '40%', discovery: 'この屋敷の先代たちの名が刻まれている。一枚だけ、名前が削り取られた墓碑がある。' }
    ],
    persons: ['old_man'],
    exits: ['corridor', 'bedroom']
  },
  bedroom: {
    id: 'bedroom',
    title: '2階の寝室',
    description: '豪華な寝室だ。机の上に奇妙な小箱が置かれている。',
    monologue: 'ご婦人の部屋か……あの小箱が気になる。何かが隠されている予感がする。',
    bg: 'bg_entrance.png',
    spots: [
      { id: 'box', label: '小箱', top: '60%', left: '70%', width: '15%', height: '15%', discovery: '十字架の形をした鍵穴がある小箱だ。何かで開けられそうだ。', usableWith: { cross_key: { text: '十字架の鍵が小箱の鍵穴にぴったりはまった！ バチッという音とともに蓋が開く。中に古い紙切れが……！', triggerEvent: 'open_box_with_key' } } },
      { id: 'bed', label: 'ベッド', top: '50%', left: '5%', width: '35%', height: '35%', discovery: 'きっちりと整えられている。今夜は使われていない。ご婦人はどこで夜を過ごしたのか。' },
      { id: 'mirror', label: '鏡台', top: '20%', left: '45%', width: '15%', height: '35%', discovery: '大きな鏡が布で覆われている。縁起担ぎか——それとも何かを隠すために？' },
      { id: 'closet', label: 'クローゼット', top: '20%', left: '0%', width: '15%', height: '60%', discovery: '洋服が乱れている。誰かが漁った跡か。奥まで確認したが——何もない。' },
      { id: 'love_letters', label: '手紙の束', top: '65%', left: '40%', width: '15%', height: '15%', discovery: 'ご婦人宛のラブレターが束になっている。差出人の署名は「A」とだけある。主ではないようだ……' }
    ],
    persons: ['lady'],
    exits: ['catacombs', 'garden_hut']
  },
  garden_hut: {
    id: 'garden_hut',
    title: '古びた小屋',
    description: '庭園の隅にある物置だ。',
    monologue: '南京錠が外れている……誰かが最近ここを使った。',
    bg: 'bg_night_transition.png',
    spots: [
      { id: 'shovel', label: '道具箱', top: '70%', left: '20%', width: '20%', height: '20%', discovery: 'ショベルを手に入れた！', item: 'shovel' },
      { id: 'old_photo', label: '古い写真', top: '20%', left: '60%', width: '20%', height: '20%', discovery: '作業員たちの集合写真。1950年代のものだ。端の一人が丁寧に切り取られている——', important: true },
      { id: 'pesticide', label: '農薬のビン', top: '40%', left: '70%', width: '15%', height: '30%', discovery: '農薬のビンが並んでいる。1本だけ空だ。毒殺——？（後に鑑識から連絡が来た。被害者に毒物反応はなかった）' },
      { id: 'padlock', label: '南京錠', top: '60%', left: '45%', width: '10%', height: '15%', discovery: '小屋の扉についていた南京錠が外れて転がっている。いつから開いていたのか。' }
    ],
    persons: [],
    exits: ['night']
  },
  night: {
    id: 'night',
    title: '庭園（ガーベラの下）',
    description: 'ドーベルマンが唸り声を上げている。どうする？',
    monologue: '真夜中の庭だ……あの盛り土が気になる。ここに何かが埋まっているのか。',
    bg: 'bg_night_transition.png',
    spots: [
      { id: 'gerbera', label: 'ガーベラの花', top: '80%', left: '50%', width: '10%', height: '10%', discovery: '土が盛り上がっている。何か埋まっているのか。ショベルがあれば掘れそうだ。', usableWith: { shovel: { text: 'ショベルで掘り始める……！', triggerEvent: 'dig_hole' } }, important: true },
      { id: 'fake_mound', label: '盛り土', top: '75%', left: '15%', width: '15%', height: '15%', discovery: '怪しい盛り土がある。ショベルで掘ってみた——石ころだけだ。' },
      { id: 'dog_collar', label: '首輪', top: '60%', left: '70%', width: '12%', height: '10%', discovery: 'ドーベルマンの首輪に「MAX」と刻まれている。なだめると少し甘えてきた。' },
      { id: 'garden_wall', label: '塀', top: '10%', left: '0%', width: '20%', height: '60%', discovery: '高い石造りの塀だ。乗り越えるのは難しい。敷地の外には出られない。' }
    ],
    persons: ['dog'],
    exits: ['entrance', 'garden_hut']
  }
};

const CHARACTERS = {
  police: {
    name: '警官',
    expressions: {
      normal: 'char_police_normal.png',
      surprised: 'char_police_surprised.png',
      troubled: 'char_police_troubled.png'
    },
    // requireFlag: そのフラグが立っていないとスキップされる
    scripts: [
      { text: "「鑑識の結果を待っているところです。」", emotion: "normal" },
      { text: "「こんな事件は初めて見ます……凶器もまだ見つかっていない。」", emotion: "troubled" },
      { text: "「な、なんだって！？ 庭に遺体が……それは本当ですか！」", emotion: "surprised", requireFlag: "found_body" },
      { text: "「あなたが頼りです。どうか真相を……」", emotion: "troubled", requireFlag: "found_body" }
    ],
    keywords: {
      '旦那様':   { text: "「被害者は屋敷の主です。昨夜、和室で亡くなっていたのが発見されました。」", emotion: "normal" },
      '死亡時刻': { text: "「鑑識によると昨夜11時から12時の間と。廊下の柱時計が止まっている時刻と一致します。」", emotion: "normal" },
      '凶器':     { text: "「……まだ見つかっていません。鋭利なものと思われますが。」", emotion: "troubled" },
      'メイド':   { text: "「長年この屋敷で働いているようです。何か知っているかもしれません。」", emotion: "normal" },
      '遺体':     { text: "「発見が遅れてしまいました……もっと早く気づいていれば。」", emotion: "troubled", requireFlag: "found_body" }
    },
    usableWith: {
      police_badge: { text: "「それは私も持っています。捜査を続けてください。」", emotion: "normal" }
    }
  },
  maid: {
    name: 'メイド',
    expressions: {
      normal: 'char_maid_normal.png',
      averted: 'char_maid_averted.png',
      crying: 'char_maid_crying.png'
    },
    scripts: [
      { text: "「旦那様は…いつもこの時間は書斎にいらっしゃいました。」", emotion: "normal" },
      { text: "「私、何も見ていません…本当です…。」", emotion: "averted" },
      { text: "「ううっ…ひどすぎます…あんなことになるなんて…」", emotion: "crying" },
      { text: "「…もう隠せません。旦那様は…私の兄を殺したんです。1952年に。あの写真に写っているのが、兄なんです」", emotion: "averted", requireFlag: "found_body" }
    ],
    keywords: {
      '旦那様': { text: "「……真面目な方でした。でも1952年を境に、どこか変わってしまわれたんです。」", emotion: "averted" },
      '1952年': { text: "「……その年のことは……忘れたいんです。お願いですから。」", emotion: "averted" },
      '来客':   { text: "「昨夜はお客様が来られたようですが……誰かは存じません。その方が怖かったから、記録に書けなかったんです……。」", emotion: "averted" },
      '写真':   { text: "「あの顔が切り取られた写真……その人が……私の兄に似ているんです。」", emotion: "crying", requireFlag: "found_defaced_photo" },
      '遺体':   { text: "「……庭に……そんなところに……もしかして……兄が……！」", emotion: "crying", requireFlag: "found_body" }
    },
    usableWith: {
      old_letter:     { text: "「それは……！旦那様の筆跡……！『例の件は墓まで持っていく』……私、もう……」", emotion: "crying", triggerFlag: "shown_letter_to_maid" },
      defaced_photo:  { text: "「この顔が切り取られた写真……！兄です……兄なんです……！旦那様が隠していたんですね……！」", emotion: "crying", triggerFlag: "shown_photo_to_maid" }
    }
  },
  old_man: {
    name: '爺や',
    expressions: {
      normal: 'Elderly_butler_character_portrait_in_pixel_art_sty-1770439327733.png'
    },
    scripts: [
      { text: "「この先の寝室には、奥様がいらっしゃいますぞ。」", emotion: "normal" },
      { text: "「旦那様は1952年を境に変わってしまわれました。何か重いものを背負っておられた……」", emotion: "normal" },
      { text: "「……あの方は若い頃、ひどいことをなさった。ずっと後悔しておられたようでしたが……」", emotion: "normal", requireFlag: "found_old_letter" }
    ],
    keywords: {
      '1952年':   { text: "「ああ……あの年か。旦那様が大きく変わられた年じゃ。何かあったに違いない。」", emotion: "normal" },
      '旦那様':   { text: "「厳しい方でしたが、晩年は何かに怯えておられるようでしたな……」", emotion: "normal" },
      'メイド':   { text: "「あの娘は何か知っておる。ずっと旦那様を見続けてきたはずじゃ。」", emotion: "normal" },
      'カタコンベ': { text: "「この屋敷の地下には先代から続く隠し場所がありましての。近頃は誰かが使った形跡がありましたが……」", emotion: "normal" }
    },
    usableWith: {
      old_letter: { text: "「その手紙は……！旦那様が書かれたものじゃ！やはり……あの方は何かを隠しておられたのじゃ……」", emotion: "normal", triggerFlag: "shown_letter_to_old_man" }
    }
  },
  lady: {
    name: 'ご婦人',
    expressions: {
      normal: 'Haughty_aristocratic_lady_character_portrait_in_pi-1770439332402.png'
    },
    scripts: [
      { text: "「あら、部外者が私の部屋に何の用かしら？」", emotion: "normal" },
      { text: "「主人のことを調べているの？ 余計なお世話ですわ。」", emotion: "normal" },
      { text: "「……主人は変わった人でした。いつも何かに怯えているようで。最後まで何も話してくれなかった。」", emotion: "normal", requireFlag: "found_old_letter" }
    ],
    keywords: {
      '旦那様': { text: "「複雑な方でした。愛していましたが……秘密が多すぎた。」", emotion: "normal" },
      '手紙':   { text: "「主人は書斎でよく手紙を書いていたわ。でも中身は見せてくれなかった。」", emotion: "normal" },
      'メイド': { text: "「あの娘……主人を見るときの目が、ずっと気になっていましたの。」", emotion: "normal" },
      '1952年': { text: "「……その年のことは、主人は絶対に話しませんでした。触れるたびに顔が曇った。」", emotion: "normal", requireFlag: "found_old_letter" }
    },
    usableWith: {
      cross_key:  { text: "「その十字架……どこで？ カタコンベの祭壇に……何か関係があるのかしら。」", emotion: "normal" },
      old_letter: { text: "「これは……主人の字……！ 『例の件は墓まで持っていく』……何のこと……？」", emotion: "normal" }
    }
  },
  dog: {
    name: 'ドーベルマン',
    expressions: {
      normal: 'Menacing_Doberman_attack_dog_or_skeletal_remains_i-1770439313567.png'
    },
    scripts: [
      { text: "（激しく吠えている！） 1.なだめる 2.強行突破", emotion: "normal", isChoice: true }
    ]
  }
};

const ITEMS = {
  police_badge: {
    name: '警察手帳',
    image: 'item_police_badge.png',
    description: 'あなたの警察手帳だ。'
  },
  defaced_photo: {
    name: '傷つけられた写真',
    image: 'item_defaced_photo.png',
    description: '顔が切り取られた古い写真だ。意図的に消された跡がある。誰かに知られたくなかったのだろうか。'
  },
  old_letter: {
    name: '古い手紙',
    image: 'item_old_letter.png',
    description: '「例の件は墓まで持っていく。あの子には知らせるな。すべては1952年のあの夜のことだ」——主の筆跡。'
  },
  washitsu_key: {
    name: '和室の鍵',
    image: 'item_washitsu_key.png',
    description: '古い鍵だ。'
  },
  cross_key: {
    name: '小さな十字架',
    image: 'Small_ornate_cross_key_in_pixel_art_style_Victori-1770439345443.png',
    description: 'カタコンベで見つけた。'
  },
  treasure_map: {
    name: '古い紙切れ',
    image: 'item_old_letter.png',
    description: '「宝は庭園のガーベラの下に埋めた」'
  },
  shovel: {
    name: 'ショベル',
    image: 'Antique_garden_shovel_tool_in_pixel_art_style_Vic-1770439336366.png',
    description: '土を掘るための道具。'
  },
  skeleton: {
    name: '骸',
    image: 'Remove_the_skeleton_completely_from_the_image_Kee-1770439430538.png',
    description: '庭に埋められていた遺体だ…！'
  }
};

const COMMANDS = [
  { id: 'talk', label: '話す' },
  { id: 'ask',  label: 'きく' },
  { id: 'look', label: '調べる' },
  { id: 'use',  label: 'つかう' },
  { id: 'move', label: '移動' },
  { id: 'item', label: '持ち物' },
  { id: 'log',  label: 'ログ' },
  { id: 'save', label: 'セーブ' },
  { id: 'load', label: 'ロード' }
];
