import { Star, Planet, Achievement } from './types';

// Coordinates derived from next-main percentages: nx = (x - 50)/50, ny = (50 - y)/50
export const MOCK_STARS: Star[] = [
  {
    id: 'a7777777-7777-7777-7777-777777777777', // alkaid
    name: 'Văn Hóa',
    color: '#ec4899', // Pink
    position_x: -0.914, // (4.3 - 50) / 50
    position_y: -0.06,  // (50 - 53) / 50
    icon: '🎭'
  },
  {
    id: 'a2222222-2222-2222-2222-222222222222', // mizar
    name: 'Nghệ thuật',
    color: '#a855f7', // Purple
    position_x: -0.54,
    position_y: 0.22,
    icon: '🎨'
  },
  {
    id: 'a3333333-3333-3333-3333-333333333333', // alcor (binary companion)
    name: 'Khoa học',
    color: '#22c55e', // Green
    position_x: -0.35,
    position_y: 0.40,
    icon: '🔬'
  },
  {
    id: 'a5555555-5555-5555-5555-555555555555', // alioth
    name: 'Chính trị',
    color: '#6366f1', // Indigo
    position_x: -0.164, // (41.8 - 50) / 50
    position_y: 0.124,  // (50 - 43.8) / 50
    icon: '👑'
  },
  {
    id: 'a4444444-4444-4444-4444-444444444444', // megrez
    name: 'Triết học',
    color: '#eab308', // Yellow
    position_x: 0.216,  // (60.8 - 50) / 50
    position_y: 0.016,  // (50 - 49.2) / 50
    icon: '📜'
  },
  {
    id: 'a8888888-8888-8888-8888-888888888888', // phecda
    name: 'Quân sự',
    color: '#ef4444', // Red
    position_x: 0.356,  // (67.8 - 50) / 50
    position_y: -0.456, // (50 - 72.8) / 50
    icon: '⚔️'
  },
  {
    id: 'a6666666-6666-6666-6666-666666666666', // merak
    name: 'Giáo dục',
    color: '#f97316', // Orange
    position_x: 0.894,  // (94.7 - 50) / 50
    position_y: -0.24,  // (50 - 62) / 50
    icon: '🎓'
  },
  {
    id: 'a1111111-1111-1111-1111-111111111111', // dubhe
    name: 'Công nghệ',
    color: '#3b82f6', // Blue
    position_x: 0.89,   // (94.5 - 50) / 50
    position_y: 0.38,   // (50 - 31) / 50
    icon: '💻'
  }
];

export const MOCK_PLANETS: Planet[] = [
  // --- ALKAID: VĂN HÓA ---
  {
    id: 'nguyen-trai',
    star_id: 'a7777777-7777-7777-7777-777777777777',
    name: 'Nguyễn Trãi',
    bio: 'Nguyễn Trãi (hiệu Ức Trai) là một nhà chính trị, nhà quân sự kiệt xuất và danh nhân văn hóa thế giới thời Lê sơ. Ông là người đã phò tá Lê Lợi lật đổ ách đô hộ của nhà Minh, soạn thảo áng văn thiên cổ bất hủ "Bình Ngô Đại Cáo" khẳng định nền độc lập trường tồn của dân tộc Việt Nam.',
    avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
    orbit_radius: 2.3,
    orbit_speed: 1.0,
    planet_seed: 45781,
    planet_size: 0.54
  },
  {
    id: 'nguyen-du',
    star_id: 'a7777777-7777-7777-7777-777777777777',
    name: 'Nguyễn Du',
    bio: 'Nguyễn Du (tự Tố Như, hiệu Thanh Hiên) là nhà thơ lớn của Việt Nam thời Tây Sơn và đầu triều Nguyễn. Với vốn hiểu biết sâu rộng, trái tim nhân đạo mênh mông, ông đã viết nên kiệt tác "Truyện Kiều" (Đoạn trường tân thanh) khắc họa sâu sắc số phận đau khổ của con người, đặc biệt là người phụ nữ trong xã hội phong kiến phong trần.',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    orbit_radius: 4.0,
    orbit_speed: 0.7,
    planet_seed: 98124,
    planet_size: 0.48
  },

  // --- MIZAR: NGHỆ THUẬT ---
  {
    id: 'trinh-cong-son',
    star_id: 'a2222222-2222-2222-2222-222222222222',
    name: 'Trịnh Công Sơn',
    bio: 'Trịnh Công Sơn được coi là một trong những nhạc sĩ lớn nhất của Tân nhạc Việt Nam. Nhạc của ông đậm chất triết lý nhân sinh, thấm đượm tình yêu, thân phận và ước vọng hòa bình. Những sáng tác bất hủ như "Diễm xưa", "Cát bụi", "Huyền thoại mẹ" chứa đựng dòng âm điệu mê hoặc lòng người qua nhiều thế hệ.',
    avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    orbit_radius: 2.5,
    orbit_speed: 0.9,
    planet_seed: 11223,
    planet_size: 0.52
  },
  {
    id: 'to-ngoc-van',
    star_id: 'a2222222-2222-2222-2222-222222222222',
    name: 'Tô Ngọc Vân',
    bio: 'Tô Ngọc Vân là một họa sĩ xuất sắc, thuộc thế hệ đầu tiên của Trường Cao đẳng Mỹ thuật Đông Dương. Ông đã đóng góp to lớn vào việc đưa chất liệu sơn dầu phương Tây hòa quyện đậm đà với linh hồn dân tộc Việt Nam. Ông hy sinh anh dũng trong chiến dịch Điện Biên Phủ lịch sử.',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    orbit_radius: 4.2,
    orbit_speed: 0.6,
    planet_seed: 55443,
    planet_size: 0.46
  },

  // --- ALCOR: KHOA HỌC ---
  {
    id: 'luong-the-vinh',
    star_id: 'a3333333-3333-3333-3333-333333333333',
    name: 'Lương Thế Vinh',
    bio: 'Lương Thế Vinh là trạng nguyên dưới thời vua Lê Thánh Tông. Ông là một nhà toán học lỗi lạc, tác giả cuốn sách "Đại thành toán pháp" - một cuốn sách toán giáo lý hoàn chỉnh đầu tiên của nước ta. Ông được mệnh danh là Thần Toán hay "Trạng Lường" nhờ vào tài đo đạc và tư duy toán học thông thái.',
    avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    orbit_radius: 2.0,
    orbit_speed: 1.1,
    planet_seed: 88776,
    planet_size: 0.48
  },
  {
    id: 'ton-that-tung',
    star_id: 'a3333333-3333-3333-3333-333333333333',
    name: 'Tôn Thất Tùng',
    bio: 'Tôn Thất Tùng là bác sĩ y học vĩ đại người Việt Nam, nổi danh khắp năm châu nhờ phương pháp mổ gan "khô" vô cùng nhanh chóng và hiệu quả, giảm tỷ lệ tử vong và biến chứng tối đa cho bệnh nhân. Ông đã viết cuốn sách kinh điển về cấu trúc gan và để lại một trường phái y khoa rực rỡ.',
    avatar_url: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150',
    orbit_radius: 3.8,
    orbit_speed: 0.8,
    planet_seed: 66554,
    planet_size: 0.52
  },

  // --- ALIOTH: CHÍNH TRỊ ---
  {
    id: 'ho-chi-minh',
    star_id: 'a5555555-5555-5555-5555-555555555555',
    name: 'Hồ Chí Minh',
    bio: 'Hồ Chí Minh là vị lãnh tụ vĩ đại của cách mạng Việt Nam, người sáng lập Đảng Cộng sản Việt Nam và khai sinh ra nước Việt Nam Dân chủ Cộng hòa độc lập. Ông dâng trọn đời mình cho độc lập tự do của dân tộc thông qua các chiến dịch ngoại giao tài ba và tài thao lược xuất sắc trên thế giới.',
    avatar_url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150',
    orbit_radius: 2.6,
    orbit_speed: 1.25,
    planet_seed: 77112,
    planet_size: 0.56
  },
  {
    id: 'tran-hung-dao',
    star_id: 'a5555555-5555-5555-5555-555555555555',
    name: 'Trần Hưng Đạo',
    bio: 'Trần Quốc Tuấn (tước hiệu Trần Hưng Đạo) không chỉ là nhà quân sự mà còn là một chính trị gia khôn khéo tầm quốc tế. Ông khuyên răn các vua Trần gắn bó mật thiết với nhân dân bảo vệ bờ cõi bằng tinh thần "khoan thư sức dân làm kế sâu rễ bền gốc" lừng lẫy thiên cổ.',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    orbit_radius: 4.5,
    orbit_speed: 0.75,
    planet_seed: 99001,
    planet_size: 0.54
  },

  // --- MEGREZ: TRIẾT HỌC ---
  {
    id: 'chu-van-an',
    star_id: 'a4444444-4444-4444-4444-444444444444',
    name: 'Chu Văn An',
    bio: 'Chu Văn An là nhà triết giáo, nhà sư phạm lỗi lạc chính trực và mẫu mực của Đại Việt thời Trần. Ông là người biên soạn giáo án "Tứ thư thuyết ước" truyền thụ tư tưởng nhân nghĩa, tự lập chính tâm. Ông từng dâng sớ chém 7 nịnh thần triều đình để cứu nước, giữ vững khí tiết thanh nhã suốt đời.',
    avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
    orbit_radius: 2.4,
    orbit_speed: 1.0,
    planet_seed: 77665,
    planet_size: 0.48
  },
  {
    id: 'nguyen-binh-khiem',
    star_id: 'a4444444-4444-4444-4444-444444444444',
    name: 'Nguyễn Bỉnh Khiêm',
    bio: 'Nguyễn Bỉnh Khiêm là triết học gia lỗi lạc có tầm nhìn chiến lược đi trước hàng trăm năm lịch sử trung đại Việt Nam. Với kiến thức Dịch học uyên thâm, ông am tường thế giới tự nhiên và xã hội, viết hàng ngàn tác phẩm chữ Hán, chữ Nôm răn dạy con người sống hiền lương, tự tại, nhân nghĩa.',
    avatar_url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150',
    orbit_radius: 4.0,
    orbit_speed: 0.7,
    planet_seed: 88221,
    planet_size: 0.52
  },

  // --- PHECDA: QUÂN SỰ ---
  {
    id: 'vo-nguyen-giap',
    star_id: 'a8888888-8888-8888-8888-888888888888',
    name: 'Võ Nguyên Giáp',
    bio: 'Võ Nguyên Giáp là Đại tướng đầu tiên, Tổng tư lệnh Quân đội Nhân dân Việt Nam anh hùng. Được ghi danh là một trong những thống soái vĩ đại nhất của văn minh loài người, ông đã đánh bại hai đế quốc thực dân Pháp cường bạo và xâm lược Mỹ bằng nghệ thuật chiến tranh nhân dân sáng tạo, xoay chuyển cục diện lịch sử.',
    avatar_url: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150',
    orbit_radius: 2.5,
    orbit_speed: 1.15,
    planet_seed: 44889,
    planet_size: 0.58
  },
  {
    id: 'ly-thuong-kiet',
    star_id: 'a8888888-8888-8888-8888-888888888888',
    name: 'Lý Thường Kiệt',
    bio: 'Lý Thường Kiệt là một danh tướng kiệt xuất đời nhà Lý Việt Nam. Ông lập công hiển hách đánh Tống, bình Chiêm giữ vững phên giậu nước nhà. Ông là người chủ trương tiên phát chế nhân làm đảo lộn hoàn toàn mưu đồ xâm lấn của quân địch, kiến tạo phòng tuyến sông Như Nguyệt huyền thoại.',
    avatar_url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150',
    orbit_radius: 4.4,
    orbit_speed: 0.65,
    planet_seed: 12299,
    planet_size: 0.5
  },

  // --- MERAK: GIÁO DỤC ---
  {
    id: 'le-quy-don',
    star_id: 'a6666666-6666-6666-6666-666666666666',
    name: 'Lê Quý Đôn',
    bio: 'Lê Quý Đôn (tự Doãn Hậu, hiệu Cát Sỹ) là nhà bác học lớn nhất thời trung đại Việt Nam. Với tư duy bác học bách khoa uyên thâm bậc nhất, ông biên soạn giáo trình giảng dạy khổng lồ cho nho sĩ sĩ tử, tổng hợp trọn đời tri thức về triết học, địa lý, sử học, văn học, thiên văn.',
    avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    orbit_radius: 2.7,
    orbit_speed: 0.95,
    planet_seed: 55667,
    planet_size: 0.5
  },
  {
    id: 'nguyen-dinh-chieu',
    star_id: 'a6666666-6666-6666-6666-666666666666',
    name: 'Nguyễn Đình Chiểu',
    bio: 'Nguyễn Đình Chiểu (thường gọi cụ Đồ Chiểu) là một danh nhân xuất thân nhà giáo mẫu mực ái quốc lỗi lạc ở phương Nam. Bị mù cả hai mắt từ trẻ, cụ Đồ Chiểu vượt lên bi kịch gia đạo mở trường dạy học, bốc thuốc cứu người bách tính và sáng tác những vần thơ bất hủ kích lệ tinh thần đánh giặc.',
    avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    orbit_radius: 4.6,
    orbit_speed: 0.6,
    planet_seed: 33221,
    planet_size: 0.46
  },

  // --- DUBHE: CÔNG NGHỆ ---
  {
    id: 'tran-dai-nghia',
    star_id: 'a1111111-1111-1111-1111-111111111111',
    name: 'Trần Đại Nghĩa',
    bio: 'Phạm Quang Lễ (tên hiệu Trần Đại Nghĩa) là giáo sư, viện sĩ khoa học sáng chế vĩ đại thời đại Hồ Chí Minh. Tiếp thu kiến thức chế tạo máy bay và vũ khí hiện đại bậc cao tại Pháp, ông theo Bác Hồ về nước lập công biên soạn tài liệu và trực tiếp thiết kế, chế tạo nên khí tài đặc chủng Bazooka, SKZ hủy diệt xe tăng lô cốt thực dân.',
    avatar_url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150',
    orbit_radius: 2.4,
    orbit_speed: 1.05,
    planet_seed: 77119,
    planet_size: 0.53
  },
  {
    id: 'nguyen-an',
    star_id: 'a1111111-1111-1111-1111-111111111111',
    name: 'Nguyễn An',
    bio: 'Nguyễn An là tổng công trình sư, kiến trúc sư đại tài người Việt gốc Hà Đông dưới triều Minh phong kiến. Bị bắt sang Trung Quốc làm nội quan sau thất bại của nhà Hồ, nhờ tài cao phi phàm về tính toán cấu trúc xây dựng và vẽ đồ bản trị thủy sông ngòi, ông được giao đại nhiệm thiết kế và làm tổng đốc xây dựng Tử Cấm Thành uy nghi trấn giữ Bắc Kinh.',
    avatar_url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150',
    orbit_radius: 4.5,
    orbit_speed: 0.7,
    planet_seed: 99112,
    planet_size: 0.48
  }
];

export const MOCK_ACHIEVEMENTS: Achievement[] = [
  // Nguyễn Trãi
  {
    id: 'c7777777-1111-1111-1111-111111111111',
    planet_id: 'nguyen-trai',
    title: 'Soạn thảo Bình Ngô Đại Cáo',
    description: 'Chủ trì soạn thảo Đại bản tuyên ngôn độc lập thứ hai của dân tộc Việt Nam sau chiến thắng giặc Minh.',
    year: 1428,
    category: 'Văn chương'
  },
  {
    id: 'c7777777-1111-1111-1111-222222222222',
    planet_id: 'nguyen-trai',
    title: 'Danh nhân Văn hóa Thế giới',
    description: 'Được Tổ chức Giáo dục, Khoa học và Văn hóa Liên Hợp Quốc (UNESCO) vinh danh chính thức nhân kỷ niệm 600 năm ngày sinh.',
    year: 1980,
    category: 'UNESCO'
  },
  {
    id: 'c7777777-1111-1111-1111-333333333333',
    planet_id: 'nguyen-trai',
    title: 'Quốc âm thi tập',
    description: 'Tác giả của tập thơ Nôm cổ nhất và phong phú nhất còn lưu lại đến ngày nay, đặt nền móng văn học dân tộc.',
    year: 1430,
    category: 'Thơ Nôm'
  },

  // Nguyễn Du
  {
    id: 'c7777777-2222-1111-1111-111111111111',
    planet_id: 'nguyen-du',
    title: 'Sáng tác kiệt tác Truyện Kiều',
    description: 'Bản trường ca thơ lục bát kiệt xuất Đoạn trường tân thanh, đỉnh cao văn học trung đại, dịch ra hơn 20 ngôn ngữ.',
    year: 1810,
    category: 'Văn học'
  },
  {
    id: 'c7777777-2222-1111-1111-222222222222',
    planet_id: 'nguyen-du',
    title: 'Vinh danh Văn hóa Thế giới',
    description: 'Được Hội đồng Hòa bình Thế giới quyết định kỷ niệm sinh nhật như một Danh nhân Văn hóa Thế giới.',
    year: 1965,
    category: 'Danh nhân'
  },

  // Trịnh Công Sơn
  {
    id: 'c2222222-1111-1111-1111-111111111111',
    planet_id: 'trinh-cong-son',
    title: 'Nhận giải thưởng đĩa vàng (Golden Disc)',
    description: 'Nhận giải thưởng đĩa vàng tại Nhật Bản cho ca khúc "Diễm xưa" với số lượng phát hành khổng lồ.',
    year: 1972,
    category: 'Âm nhạc'
  },
  {
    id: 'c2222222-1111-1111-1111-222222222222',
    planet_id: 'trinh-cong-son',
    title: 'Giải Âm nhạc Hòa bình Quốc tế',
    description: 'Được trao tặng giải thưởng Âm nhạc hòa bình quốc tế cao quý cho những thông điệp nhân văn trong tác phẩm.',
    year: 2004,
    category: 'Hòa bình'
  },

  // Tô Ngọc Vân
  {
    id: 'c2222222-2222-1111-1111-111111111111',
    planet_id: 'to-ngoc-van',
    title: 'Vẽ kiệt tác Thiếu nữ bên hoa huệ',
    description: 'Sáng tác bức họa sơn dầu kinh điển mang tính biểu tượng cao của nền mỹ thuật Việt Nam hiện đại.',
    year: 1943,
    category: 'Mỹ thuật'
  },

  // Lương Thế Vinh
  {
    id: 'c3333333-1111-1111-1111-111111111111',
    planet_id: 'luong-the-vinh',
    title: 'Đại thành toán pháp',
    description: 'Biên soạn bộ sách toán học giáo khoa đầu tiên của bờ cõi Việt Nam, ứng dụng đo đạc vĩ đại.',
    year: 1470,
    category: 'Toán học'
  },

  // Tôn Thất Tùng
  {
    id: 'c3333333-2222-1111-1111-111111111111',
    planet_id: 'ton-that-tung',
    title: 'Phát minh phương pháp cắt gan khô',
    description: 'Phát minh ra phương pháp mổ cắt gan cực nhanh trong vòng vài phút mang tên "Phương pháp Tôn Thất Tùng" nổi tiếng toàn cầu.',
    year: 1939,
    category: 'Y học'
  },

  // Hồ Chí Minh
  {
    id: 'c5555555-1111-1111-1111-111111111111',
    planet_id: 'ho-chi-minh',
    title: 'Đọc Tuyên ngôn Độc lập',
    description: 'Đọc bản Tuyên ngôn Độc lập tại quảng trường Ba Đình lịch sử khai sinh ra nước Việt Nam Dân chủ Cộng hòa.',
    year: 1945,
    category: 'Chính trị'
  },
  {
    id: 'c5555555-1111-1111-1111-222222222222',
    planet_id: 'ho-chi-minh',
    title: 'Danh nhân Văn hóa - Anh hùng dân tộc',
    description: 'Được UNESCO công nhận là Anh hùng giải phóng dân tộc Việt Nam và Nhà văn hóa kiệt xuất.',
    year: 1990,
    category: 'UNESCO'
  },

  // Trần Hưng Đạo
  {
    id: 'c5555555-2222-1111-1111-111111111111',
    planet_id: 'tran-hung-dao',
    title: 'Chiến thắng sông Bạch Đằng',
    description: 'Đại thắng quân Mông Nguyên lần thứ 3 trên sông Bạch Đằng bằng chiến thuật cọc gỗ độc đáo.',
    year: 1288,
    category: 'Quân sự'
  },

  // Chu Văn An
  {
    id: 'c4444444-1111-1111-1111-111111111111',
    planet_id: 'chu-van-an',
    title: 'Dâng sớ Thất trảm sớ',
    description: 'Khảng khái dâng sớ xin chém đầu 7 nịnh thần triều đình tham nhũng hại dân hại nước dưới triều Trần.',
    year: 1360,
    category: 'Tư tưởng'
  },

  // Võ Nguyên Giáp
  {
    id: 'c8888888-1111-1111-1111-111111111111',
    planet_id: 'vo-nguyen-giap',
    title: 'Đại thắng Điện Biên Phủ',
    description: 'Chỉ huy chiến dịch đánh sập tập đoàn cứ điểm Điện Biên Phủ của quân viễn chinh Pháp lừng lẫy địa cầu.',
    year: 1954,
    category: 'Quân sự'
  },

  // Lý Thường Kiệt
  {
    id: 'c8888888-2222-1111-1111-111111111111',
    planet_id: 'ly-thuong-kiet',
    title: 'Nam quốc sơn hà',
    description: 'Tác giả bài thơ thần vang dội tại phòng tuyến sông Như Nguyệt, được coi là bản Tuyên ngôn Độc lập đầu tiên.',
    year: 1077,
    category: 'Quân sự'
  },

  // Lê Quý Đôn
  {
    id: 'c6666666-1111-1111-1111-111111111111',
    planet_id: 'le-quy-don',
    title: 'Biên soạn Vân đài loại ngữ',
    description: 'Tác phẩm bách khoa toàn thư tri thức khoa học giáo dục đầu tiên của Việt Nam.',
    year: 1773,
    category: 'Bác học'
  },

  // Trần Đại Nghĩa
  {
    id: 'c1111111-1111-1111-1111-111111111111',
    planet_id: 'tran-dai-nghia',
    title: 'Chế tạo vũ khí Bazooka quân sự',
    description: 'Nghiên cứu cải tiến và trực tiếp chế tạo súng Bazooka và súng không giật SKZ phá hủy xe tăng lô cốt giặc Pháp cứu nước.',
    year: 1947,
    category: 'Chế tạo'
  }
];
