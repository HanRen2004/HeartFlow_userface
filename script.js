document.addEventListener("DOMContentLoaded", () => {
    // 显示问候语
    function getGreeting() {
        const now = new Date();
        const hour = now.getHours();

        if (hour >= 6 && hour < 9) {
            return "早上好！";
        } else if (hour >= 9 && hour < 12) {
            return "上午好！";
        } else if (hour >= 12 && hour < 18) {
            return "下午好！";
        } else if (hour >= 18 && hour < 22) {
            return "晚上好！";
        } else {
            return "夜深了~";
        }
    }

    function updateGreeting() {
        const greetingElement = document.getElementById("greeting");
        greetingElement.textContent = getGreeting();
    }

    // 初始显示
    updateGreeting();

    //每隔1分钟更新一次
    setInterval(updateGreeting, 1000);
    // 导航切换
    document.querySelectorAll(".nav-item").forEach((item) => {
        item.addEventListener("click", function (e) {
            e.preventDefault();
            document
                .querySelectorAll(".nav-item")
                .forEach((nav) => nav.classList.remove("active"));
            this.classList.add("active");

            const targetId = this.getAttribute("href").substring(1);
            document.querySelectorAll(".page-section").forEach((section) => {
                section.classList.remove("active");
            });
            document.getElementById(targetId).classList.add("active");
        });
    });

    // 聊天功能
    const messageInput = document.getElementById("messageInput");
    const sendButton = document.getElementById("sendButton");
    const chatMessages = document.querySelector(".chat-messages");

    sendButton.addEventListener("click", sendMessage);
    messageInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") sendMessage();
    });

    // 聊天会话管理
    class ChatSessionManager {
        constructor() {
            this.sessions = JSON.parse(localStorage.getItem("chatSessions")) || [];
            this.currentSessionId = localStorage.getItem("currentSessionId");
            this.init();
        }

        init() {
            this.renderSessions();
            this.setupEventListeners();
            this.setupSidebarToggle();
        }

        setupEventListeners() {
            // 新建会话按钮
            document
                .querySelector(".new-chat")
                .addEventListener("click", () => this.createNewSession());

            // 搜索功能
            document.getElementById("searchChat").addEventListener("input", (e) => {
                this.searchSessions(e.target.value);
            });

            // 批量管理按钮
            document
                .querySelector(".batch-actions button")
                .addEventListener("click", () => {
                    this.toggleBatchMode();
                });
        }

        setupSidebarToggle() {
            const sidebar = document.getElementById("chatSidebar");
            const toggleBtn = document.getElementById("toggleSidebar");

            toggleBtn.addEventListener("click", () => {
                sidebar.classList.toggle("collapsed");
                // 保存侧边栏状态
                localStorage.setItem(
                    "sidebarCollapsed",
                    sidebar.classList.contains("collapsed")
                );
            });

            // 恢复侧边栏状态
            if (localStorage.getItem("sidebarCollapsed") === "true") {
                sidebar.classList.add("collapsed");
            }
        }

        createNewSession() {
            const session = {
                id: Date.now().toString(),
                title: `会话 ${this.sessions.length + 1}`,
                messages: [],
                createdAt: new Date().toISOString(),
            };

            this.sessions.unshift(session);
            this.currentSessionId = session.id;
            this.saveSessions();
            this.renderSessions();
            this.loadSession(session.id);

            // 确保 loading 元素存在
            const chatMessages = document.getElementById("chatMessages");
            if (!chatMessages.querySelector(".loading-dots")) {
                const loadingDiv = document.createElement("div");
                loadingDiv.className = "loading-dots";
                loadingDiv.style.display = "none";
                loadingDiv.innerHTML = `<div></div><div></div><div></div><div></div>`;
                chatMessages.appendChild(loadingDiv);
            }
        }

        saveSessions() {
            localStorage.setItem("chatSessions", JSON.stringify(this.sessions));
            localStorage.setItem("currentSessionId", this.currentSessionId);
        }

        renderSessions() {
            const chatList = document.getElementById("chatList");
            chatList.innerHTML = this.sessions
                .map(
                    (session) => `
                <div class="chat-item ${session.id === this.currentSessionId ? "active" : ""
                    }" 
                     data-id="${session.id}">
                    <div class="chat-item-content">
                        <div class="chat-item-title">${session.title}</div>
                        <div class="chat-item-meta">
                            ${new Date(session.createdAt).toLocaleString()}
                        </div>
                    </div>
                    <div class="chat-item-actions">
                        <button class="chat-item-action delete" title="删除会话">
                            <svg viewBox="0 0 24 24" width="16" height="16">
                                <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                            </svg>
                        </button>
                    </div>
                </div>
            `
                )
                .join("");

            // 添加点击事件
            chatList.querySelectorAll(".chat-item").forEach((item) => {
                // 加载会话点击事件
                item.addEventListener("click", (e) => {
                    // 如果点击的是删除按钮，则不切换会话
                    if (!e.target.closest(".chat-item-action")) {
                        this.loadSession(item.dataset.id);
                    }
                });

                // 删除按钮点击事件
                const deleteBtn = item.querySelector(".chat-item-action.delete");
                deleteBtn.addEventListener("click", (e) => {
                    e.stopPropagation(); // 阻止事件冒泡
                    if (confirm("确定要删除这个会话吗？")) {
                        this.deleteSession(item.dataset.id);
                    }
                });
            });
        }

        loadSession(sessionId) {
            const session = this.sessions.find((s) => s.id === sessionId);
            if (!session) return;

            this.currentSessionId = sessionId;
            this.saveSessions();

            // 更新UI
            document.querySelectorAll(".chat-item").forEach((item) => {
                item.classList.toggle("active", item.dataset.id === sessionId);
            });

            // 清空并加载消息
            const chatMessages = document.getElementById("chatMessages");
            chatMessages.innerHTML = "";
            session.messages.forEach((msg) => {
                // 添加消息到聊天界面
                const messageDiv = document.createElement("div");
                messageDiv.className = `message ${msg.type}-message`;
                messageDiv.innerHTML = `<div class="bubble">${msg.content}</div>`;
                chatMessages.appendChild(messageDiv);
            });

            // 滚动到底部
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }

        searchSessions(query) {
            const normalizedQuery = query.toLowerCase();
            document.querySelectorAll(".chat-item").forEach((item) => {
                const title = item
                    .querySelector(".chat-item-title")
                    .textContent.toLowerCase();
                item.style.display = title.includes(normalizedQuery) ? "block" : "none";
            });
        }

        toggleBatchMode() {
            const chatList = document.getElementById("chatList");
            chatList.classList.toggle("batch-mode");

            if (chatList.classList.contains("batch-mode")) {
                // 添加复选框
                document.querySelectorAll(".chat-item").forEach((item) => {
                    const checkbox = document.createElement("input");
                    checkbox.type = "checkbox";
                    checkbox.className = "batch-checkbox";
                    item.prepend(checkbox);
                });
            } else {
                // 移除复选框
                document
                    .querySelectorAll(".batch-checkbox")
                    .forEach((checkbox) => checkbox.remove());
            }
        }

        deleteSession(sessionId) {
            this.sessions = this.sessions.filter((s) => s.id !== sessionId);

            // 如果删除的是当前会话，切换到第一个会话
            if (this.currentSessionId === sessionId) {
                this.currentSessionId = this.sessions[0]?.id || null;
            }

            this.saveSessions();
            this.renderSessions();

            // 如果还有会话，加载第一个会话
            if (this.sessions.length > 0) {
                this.loadSession(this.currentSessionId);
            } else {
                // 如果没有会话了，清空聊天区域
                const chatMessages = document.getElementById("chatMessages");
                chatMessages.innerHTML = `
                    <div class="message bot-message">
                        <div class="bubble">您好呀！非常开心您来和我聊天，不管是生活中的琐事，还是心里的烦恼，都可以畅所欲言哦。</div>
                    </div>
                `;
            }
        }
    }

    // 初始化会话管理器
    const chatManager = new ChatSessionManager();

    // 修改发送消息的逻辑，将消息保存到当前会话
    function sendMessage() {
        const message = messageInput.value.trim();
        if (message) {
            // 创建用户消息
            const userMessage = {
                type: "user",
                content: message,
                timestamp: new Date().toISOString(),
            };

            // 将消息添加到当前会话
            const currentSession = chatManager.sessions.find(
                (s) => s.id === chatManager.currentSessionId
            );
            if (currentSession) {
                currentSession.messages.push(userMessage);
                chatManager.saveSessions();
            }

            // 添加用户消息到界面
            const userDiv = document.createElement("div");
            userDiv.className = "message user-message";
            userDiv.innerHTML = `<div class="bubble">${message}</div>`;
            chatMessages.appendChild(userDiv);

            // 显示加载动画
            const loading = document.querySelector(".loading-dots");
            console.log("loading:", loading)
            loading.style.display = "block";

            // 清空输入框
            messageInput.value = "";

            // 模拟机器人回复
            setTimeout(() => {
                loading.style.display = "none";

                // 创建机器人消息
                const botMessage = {
                    type: "bot",
                    content: generateResponse(message),
                    timestamp: new Date().toISOString(),
                };

                // 将机器人消息添加到当前会话
                if (currentSession) {
                    currentSession.messages.push(botMessage);
                    chatManager.saveSessions();
                }

                // 添加机器人消息到界面
                const botDiv = document.createElement("div");
                botDiv.className = "message bot-message";
                botDiv.innerHTML = `<div class="bubble">${botMessage.content}</div>`;
                chatMessages.appendChild(botDiv);

                // 滚动到底部
                chatMessages.scrollTop = chatMessages.scrollHeight;
            }, 1000);
        }
    }

    // 简单应答逻辑
    function generateResponse(message) {
        const responses = {
            你好: "您好！今天有什么想聊聊的吗？",
            压力大: "压力是生活的一部分，我们可以尝试深呼吸练习，需要我引导您吗？",
            睡不着: "失眠可能是压力导致的，建议尝试睡前冥想或听些白噪音。",
            default: "我理解您的感受，能具体说说发生了什么吗？",
        };

        return responses[message] || responses["default"];
    }

    // 放松音乐
    document.querySelectorAll(".music-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
            let newWin = window.open("newPage1.html", "_self");
        });
    });

    // 励志文章
    document.querySelectorAll(".article-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
            let newWin = window.open("newPage2.html", "_self");
        });
    });

    // 知识科普
    document.querySelectorAll(".knowledge-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
            let newWin = window.open("newPage3.html", "_self");
        });
    });

    // 心理问卷
    document.querySelectorAll(".survey-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
            let newWin = window.open("newPage4.html", "_self");
        });
    });

    // 网页推荐
    document.querySelectorAll(".Recommended-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
            let newWin = window.open("newPage5.html", "_self");
        });
    });

    // 添加卡片悬停3D效果
    document.querySelectorAll(".card").forEach((card) => {
        card.addEventListener("mousemove", (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            card.style.transform = `
                perspective(1000px)
                rotateX(${(y - rect.height / 2) / 15}deg)
                rotateY(${-(x - rect.width / 2) / 15}deg)
                scale(1.02)
            `;
        });

        card.addEventListener("mouseleave", () => {
            card.style.transform =
                "perspective(1000px) rotateX(0) rotateY(0) scale(1)";
        });
    });

    // 增强按钮点击反馈
    document.querySelectorAll("button").forEach((btn) => {
        btn.addEventListener("click", function (e) {
            const ripple = document.createElement("div");
            ripple.style.cssText = `
                position: absolute;
                width: 20px;
                height: 20px;
                background: rgba(255,255,255,0.3);
                border-radius: 50%;
                transform: translate(-50%, -50%);
                pointer-events: none;
                animation: ripple 0.6s ease-out;
            `;

            const rect = this.getBoundingClientRect();
            ripple.style.left = `${e.clientX - rect.left}px`;
            ripple.style.top = `${e.clientY - rect.top}px`;

            this.appendChild(ripple);
            setTimeout(() => ripple.remove(), 600);
        });
    });

    // 在原有样式基础上增加动态主题控制
    document.documentElement.style.setProperty("--primary-color", "#5D87A4"); // 主色调改为更柔和的蓝灰色
    document.documentElement.style.setProperty("--secondary-color", "#A4B8C4"); // 辅助色改为浅灰蓝
    document.documentElement.style.setProperty("--accent-color", "#7EA4B2"); // 强调色调整为中间色调

    const cameraButton = document.getElementById("cameraButton");
    const cameraPreview = document.getElementById("cameraPreview");
    let isCameraOpen = false; // 标志位，记录摄像头状态
    let stream = null; // 用于保存摄像头流
    let screenshotInterval = null; // 用于保存截图定时器

    // 创建用于截图的canvas元素
    const screenshotCanvas = document.createElement("canvas");
    const screenshotContext = screenshotCanvas.getContext("2d");

    // 模拟上传接口
    async function uploadImage(imageBlob, filename) {
        // 这里模拟一个上传接口
        // 实际使用时替换为真实的上传接口URL
        //http://localhost:端口号/upload
        const uploadUrl = "http://example.com/upload";

        try {
            const formData = new FormData();
            formData.append("image", imageBlob, filename);

            const response = await fetch(uploadUrl, {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                throw new Error(`上传失败: ${response.status}`);
            }

            const result = await response.json();
            console.log("图片上传成功:", result);
            return result;
        } catch (error) {
            console.error("图片上传错误:", error);
            throw error;
        }
    }

    // 截图并上传函数
    async function captureAndUpload() {
        if (!isCameraOpen || !cameraPreview.videoWidth) return;

        try {
            // 设置canvas尺寸与视频一致
            screenshotCanvas.width = cameraPreview.videoWidth;
            screenshotCanvas.height = cameraPreview.videoHeight;

            // 在canvas上绘制当前视频帧
            screenshotContext.drawImage(
                cameraPreview,
                0,
                0,
                screenshotCanvas.width,
                screenshotCanvas.height
            );

            // 生成文件名
            const now = new Date();
            const year = now.getFullYear();
            const month = (now.getMonth() + 1).toString().padStart(2, "0"); // 月份从 0 开始，需 +1
            const day = now.getDate().toString().padStart(2, "0");
            const hours = now.getHours().toString().padStart(2, "0");
            const minutes = now.getMinutes().toString().padStart(2, "0");
            const seconds = now.getSeconds().toString().padStart(2, "0");
            const filename = `${year}年${month}月${day}日${hours}时${minutes}分${seconds}秒.png`;

            // 将canvas内容转换为Blob
            const blob = await new Promise((resolve) => {
                screenshotCanvas.toBlob(resolve, "image/png");
            });

            // 上传图片
            await uploadImage(blob, filename);
        } catch (error) {
            console.error("截图上传失败:", error);
        }
    }

    if (cameraButton && cameraPreview) {
        cameraButton.addEventListener("click", async () => {
            if (isCameraOpen) {
                // 如果摄像头已打开，则关闭摄像头
                stream.getTracks().forEach((track) => track.stop()); // 停止所有轨道
                cameraPreview.style.display = "none"; // 隐藏视频预览
                cameraButton.textContent = "摄像头"; // 恢复按钮文本
                isCameraOpen = false; // 更新状态

                // 清理定时截图
                if (screenshotInterval) {
                    clearInterval(screenshotInterval);
                    screenshotInterval = null;
                }
            } else {
                // 如果摄像头未打开，则打开摄像头
                try {
                    stream = await navigator.mediaDevices.getUserMedia({
                        video: {
                            facingMode: "user", // 使用前置摄像头
                        },
                        audio: false, // 不需要音频
                    });

                    cameraPreview.srcObject = stream; // 将视频流绑定到 <video> 元素
                    cameraPreview.style.display = "block"; // 显示视频预览

                    cameraPreview.onloadedmetadata = () => {
                        cameraPreview.play(); // 播放视频
                    };

                    cameraButton.textContent = "关闭摄像头"; // 更新按钮文本
                    isCameraOpen = true; // 更新状态

                    // 启动定时截图
                    screenshotInterval = setInterval(captureAndUpload, 5000); // 每5秒截图并上传一次
                } catch (error) {
                    console.error("摄像头访问错误:", error);
                    if (error.name === "NotAllowedError") {
                        alert("请确保已授予摄像头权限。");
                    } else if (error.name === "NotFoundError") {
                        alert("未找到摄像头设备。");
                    } else if (error.name === "NotReadableError") {
                        alert("摄像头设备被占用或无法访问。");
                    } else {
                        alert("无法访问摄像头，请检查设备设置。");
                    }
                }
            }
        });
    } else {
        console.error("摄像头按钮或视频预览元素未找到！");
    }

    function openCamera() {
        cameraButton.click();
    }
});
