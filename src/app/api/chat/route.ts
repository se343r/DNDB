import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';

/** Fire-and-forget: insert one chatbot_usage row (metadata only, no message content) */
async function trackChatbotUsage(userId: string | null, sessionId: string, pathname: string) {
  try {
    const supabase = createServerSupabaseClient();
    await supabase.from('chatbot_usage').insert({
      user_id: userId ?? null,
      session_id: sessionId,
      pathname,
    });
  } catch {
    // Never block the chat response for a tracking failure
  }
}

export async function POST(req: NextRequest) {
  try {
    const { messages, pathname, userId, sessionId } = await req.json();
    const sid = sessionId || 'anon';
    const uid: string | null = userId || null;

    const geminiApiKey = process.env.GEMINI_API_KEY;

    // Detailed context descriptions based on current pathname
    let pageContext = 'đang duyệt trang chủ hoặc thông tin chung.';
    if (pathname === '/catalog') {
      pageContext = 'đang ở bản đồ chòm sao Bắc Đẩu (Catalog). Trang này hiển thị 8 ngôi sao chính tạo nên hình dáng của chòm sao Bắc Đẩu. Người dùng có thể xoay, phóng to/thu nhỏ bằng chuột và nhấp vào bất kỳ ngôi sao nào để chuyển tiếp sang hệ mặt trời của ngôi sao đó.';
    } else if (pathname === '/quizzes') {
      pageContext = 'đang ở màn hình Thử thách Tri thức (Quizzes). Trang này hiển thị bộ câu đố trắc nghiệm gồm 5 câu hỏi liên quan đến tiểu sử và thành tựu của các danh nhân lịch sử. Hoàn thành sẽ nhận được điểm và tích lũy chuỗi ngày học tập (streak).';
    } else if (pathname === '/leaderboard') {
      pageContext = 'đang ở màn hình Bảng xếp hạng Vũ Trụ (Leaderboard). Trang này hiển thị danh sách xếp hạng của các nhà thám hiểm tri thức dựa trên Cấp độ (Level), Chuỗi học tập (Streak) và Điểm số tích lũy (Stars).';
    } else if (pathname === '/recommendations') {
      pageContext = 'đang ở màn hình Đề xuất Hành trình (Recommendations). Trang này hiển thị danh sách 5 tinh cầu danh nhân được đề xuất cá nhân hóa dựa trên lịch sử xem của người dùng để khuyến khích học hỏi thêm.';
    }

    const systemInstruction = `Bạn là AstroBot, một chú robot phi hành gia tốt nghiệp thông thái, thân thiện và năng động (giống như ảnh đại diện của bạn). Bạn đóng vai trò là Trợ lý Vũ trụ Bắc Đẩu, hướng dẫn người dùng khám phá vũ trụ tri thức và tiểu sử các danh nhân.

Ngữ cảnh hiện tại: Người dùng ${pageContext}

Nhiệm vụ của bạn:
1. Trả lời các câu hỏi của người dùng bằng tiếng Việt, ngắn gọn, hấp dẫn và dễ hiểu (khoảng 2-3 câu).
2. Giải thích rõ ràng chức năng của màn hình hiện tại nếu người dùng hỏi hoặc khi bắt đầu cuộc trò chuyện.
3. Luôn giữ thái độ thân thiện, nhiệt huyết, sử dụng một số biểu tượng cảm xúc liên quan đến vũ trụ (như 🚀, 🌟, 👨‍🚀, 🛸).
4. Nếu người dùng hỏi về danh nhân, hãy tóm tắt những ý chính nổi bật nhất về họ.`;

    if (!geminiApiKey) {
      console.warn('GEMINI_API_KEY is not configured. Falling back to offline guide responses.');
      // Mock response if API key is not configured yet
      const lastMessage = messages[messages.length - 1]?.content?.toLowerCase() || '';
      let reply = 'Chào bạn! Tôi là AstroBot 👨‍🚀. Hãy cấu hình GEMINI_API_KEY trên Vercel để tôi có thể trò chuyện thông minh hơn nhé!';
      
      if (lastMessage.includes('chức năng') || lastMessage.includes('làm gì') || lastMessage.includes('giới thiệu') || lastMessage.includes('hướng dẫn')) {
        if (pathname === '/catalog') {
          reply = 'Chào bạn! Đây là Bản đồ Chòm sao Bắc Đẩu 🌌. Bạn có thể kéo chuột để xoay và cuộn chuột để phóng to/thu nhỏ. Hãy nhấp vào một ngôi sao lấp lánh (như Dubhe, Merak, Mizar...) để bay sâu vào hệ mặt trời của ngôi sao đó và khám phá các hành tinh danh nhân nhé! 🚀';
        } else if (pathname === '/quizzes') {
          reply = 'Chào bạn! Đây là màn hình Thử thách Tri thức 📝. Tại đây, bạn sẽ trả lời bộ 5 câu hỏi trắc nghiệm về cuộc đời các danh nhân. Trả lời đúng sẽ giúp bạn thăng cấp (Level), tăng điểm tích lũy và duy trì ngọn lửa học tập hàng ngày (Streak) đấy! 🌟';
        } else if (pathname === '/leaderboard') {
          reply = 'Chào bạn! Đây là Bảng xếp hạng Vũ trụ 🏆. Đây là nơi tôn vinh các nhà du hành tri thức tích cực nhất. Bạn có thể xem thứ hạng của mình so với những người khác dựa trên cấp độ, ngọn lửa streak và tổng số sao tích lũy được! Hãy cố gắng lên top nhé! 👨‍🚀';
        } else if (pathname === '/recommendations') {
          reply = 'Chào bạn! Đây là phần Đề xuất Hành trình 🌠. Thuật toán của chúng tôi đề xuất 5 danh nhân tiêu biểu phù hợp với bạn dựa trên các hành tinh bạn đã khám phá. Hãy nhấp vào một thẻ đề xuất để du hành thẳng tới tinh cầu của danh nhân đó nhé! 🛸';
        }
      } else {
        reply = `AstroBot chào bạn! 👨‍🚀 Bạn đang ở ${pageContext.replace('đang ', '')} Hãy hỏi tôi bất cứ điều gì về chức năng trang này nhé!`;
      }
      // Track usage (fire-and-forget)
      trackChatbotUsage(uid, sid, pathname || '');
      return NextResponse.json({ response: reply });
    }

    // Call Gemini API using fetch
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${geminiApiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: messages.map((m: any) => ({
            role: m.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: m.content }],
          })),
          systemInstruction: {
            parts: [{ text: systemInstruction }],
          },
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 500,
          },
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error('Gemini API Error:', data);
      throw new Error(data.error?.message || 'Lỗi khi gọi API Gemini');
    }

    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Tôi không nhận được phản hồi từ hệ thống. Hãy thử lại sau nhé!';
    // Track usage (fire-and-forget, do not await)
    trackChatbotUsage(uid, sid, pathname || '');
    return NextResponse.json({ response: reply });
  } catch (error: any) {
    console.error('Chat Route Error:', error);
    return NextResponse.json(
      { error: error.message || 'Lỗi xử lý yêu cầu' },
      { status: 500 }
    );
  }
}
