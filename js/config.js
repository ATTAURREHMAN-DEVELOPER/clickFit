const CONFIG = {
    api: {
        baseUrl: 'https://api.restful-api.dev/objects',
        imagesEndpoint: '/api/images',
        uploadEndpoint: '/upload',
        timeout: 10000
    },

    upload: {
        maxFileSize: 5 * 1024 * 1024,
        allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
        uploadDirectory: 'upload_images/'
    },

    animations: {
        aos: {
            duration: 1200,
            easing: 'ease-out-cubic',
            once: false,
            offset: 120,
            delay: 0,
            mirror: true,
            anchorPlacement: 'top-bottom'
        },
        preloader: {
            fadeInDuration: 300,
            fadeOutDuration: 300
        }
    },

    navigation: {
        scrollOffset: 80,
        scrollDuration: 1000,
        activeOffset: 150
    },

    ui: {
        navbarScrollThreshold: 100,
        messageDisplayDuration: 3000
    }
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}
