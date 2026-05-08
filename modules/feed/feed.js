/**
 * HAD-Agent — Feed Module (HAD-Feed)
 * 페이스북/인스타그램 스타일의 소셜 피드 게시판
 */

export default {
    id: 'feed',

    async init(config) {
        console.log('[HAD-Feed] 모듈 초기화 중...');
        // 동적으로 스타일 시트 로드
        if (!document.getElementById('feed-style')) {
            const link = document.createElement('link');
            link.id = 'feed-style';
            link.rel = 'stylesheet';
            link.href = 'modules/feed/feed.css?v=1';
            document.head.appendChild(link);
        }
    },

    async render(config) {
        // Mock Data: 실제 구현 시 구글 드라이브 API로 가져옴
        const mockPosts = [
            {
                id: 1,
                author: "여름오빠",
                avatar: "https://lh3.googleusercontent.com/a/ACg8ocL8...", 
                date: "3시간 전",
                category: "공지사항",
                content: "드디어 HAD-Agent의 새로운 게시판 모듈 'HAD-Feed'의 프로토타입이 완성되었습니다! 이제 사내 소식도 페이스북처럼 생생하게 공유해 보세요. 👍",
                media: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
                likes: 12,
                comments: 4
            },
            {
                id: 2,
                author: "마케팅팀",
                avatar: "https://ui-avatars.com/api/?name=MT&background=4f46e5&color=fff",
                date: "어제",
                category: "현장보고",
                content: "리버스12 신제품 현장 반응이 뜨겁습니다. 특히 텍스처와 향에 대한 만족도가 높네요. 관련 사진 첨부합니다.",
                media: "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
                likes: 45,
                comments: 12
            },
            {
                id: 3,
                author: "HAD 봇",
                avatar: config.agent.avatar,
                date: "방금 전",
                category: "AI 분석",
                content: "최근 게시판의 키워드를 분석한 결과 #리버스12 #만족도 #현장반응 이 가장 많이 언급되고 있습니다. 긍정적인 신호입니다!",
                media: null,
                likes: 8,
                comments: 2
            }
        ];

        let feedHtml = mockPosts.map(post => `
            <div class="feed-card" data-id="${post.id}">
                <div class="feed-header">
                    <img src="${post.avatar}" class="feed-avatar" onerror="this.src='https://ui-avatars.com/api/?name=${post.author}'">
                    <div class="feed-author-info">
                        <div class="feed-author-name">
                            ${post.author}
                            <span class="feed-category-tag">${post.category}</span>
                        </div>
                        <div class="feed-meta">${post.date}</div>
                    </div>
                    <div class="feed-more">⋮</div>
                </div>
                
                <div class="feed-content">${post.content}</div>
                
                ${post.media ? `
                <div class="feed-media">
                    <img src="${post.media}" loading="lazy">
                </div>
                ` : ''}
                
                <div class="feed-actions">
                    <button class="action-btn">
                        <i>👍</i> <span>좋아요 ${post.likes}</span>
                    </button>
                    <button class="action-btn">
                        <i>💬</i> <span>댓글 ${post.comments}</span>
                    </button>
                    <button class="action-btn">
                        <i>🔗</i> <span>공유</span>
                    </button>
                </div>
            </div>
        `).join('');

        return `
            <div class="feed-container">
                <div class="section-header">
                    <h2 class="section-title">최신 피드</h2>
                    <div class="section-action">모두 읽음</div>
                </div>
                ${feedHtml}
                <button class="fab-write">+</button>
            </div>
        `;
    },

    async afterRender(config) {
        console.log('[HAD-Feed] 렌더링 완료');
        
        // 이벤트 바인딩 예시
        const fab = document.querySelector('.fab-write');
        if (fab) {
            fab.onclick = () => {
                alert('글쓰기 기능은 구글 드라이브 API 연동 후 활성화됩니다. (Coming Soon!)');
            };
        }

        const cards = document.querySelectorAll('.feed-card');
        cards.forEach(card => {
            const postId = parseInt(card.dataset.id);
            const postData = [
                { id: 1, author: "여름오빠", content: "드디어 HAD-Agent의 새로운 게시판 모듈 'HAD-Feed'의 프로토타입이 완성되었습니다!" },
                { id: 2, author: "마케팅팀", content: "리버스12 신제품 현장 반응이 뜨겁습니다. 특히 텍스처와 향에 대한 만족도가 높네요." },
                { id: 3, author: "HAD 봇", content: "최근 게시판의 키워드를 분석한 결과 #리버스12 #만족도 #현장반응 이 가장 많이 언급되고 있습니다." }
            ].find(p => p.id === postId);

            // 게시물 클릭 → 컨텍스트 설정
            card.onclick = () => {
                ctx.setContextData({
                    type: 'feed_post',
                    id: postId,
                    author: postData?.author,
                    content: postData?.content
                });
                ctx.notify(`'${postData?.author}'님의 게시물이 에이전트 컨텍스트에 담겼습니다.`);
            };

            // 공유 버튼
            const shareBtn = card.querySelector('.action-btn:nth-child(3)');
            if (shareBtn) {
                shareBtn.onclick = async (e) => {
                    e.stopPropagation(); // 카드 클릭 이벤트 방지
                    
                    const shareData = {
                        title: `[${config.brand.name}] ${postData?.author}님의 게시물`,
                        text: postData?.content,
                        url: window.location.href
                    };

                    if (navigator.share) {
                        try {
                            await navigator.share(shareData);
                            console.log('공유 성공');
                        } catch (err) {
                            console.log('공유 취소 또는 실패', err);
                        }
                    } else {
                        // Web Share API 미지원 시 클립보드 복사
                        try {
                            await navigator.clipboard.writeText(`${shareData.text}\n\n출처: ${shareData.url}`);
                            ctx.notify('링크가 클립보드에 복사되었습니다.');
                        } catch (err) {
                            ctx.notify('공유 기능을 지원하지 않는 브라우저입니다.', 'error');
                        }
                    }
                };
            }
        });
    },

    destroy() {
        console.log('[HAD-Feed] 모듈 제거');
    }
};
