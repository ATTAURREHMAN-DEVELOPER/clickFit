$(document).ready(function () {

    function removePreloader() {
        setTimeout(function () {
            $('#preloader').addClass('fade-out');
            setTimeout(function () {
                $('#preloader').remove();
            }, CONFIG.animations.preloader.fadeOutDuration);
        }, CONFIG.animations.preloader.fadeInDuration);
    }


    if (document.readyState === 'complete') {
        removePreloader();
    } else {
        $(window).on('load', removePreloader);
    }


    try {
        AOS.init(CONFIG.animations.aos);
    } catch (error) {
        console.error('AOS initialization failed:', error);
    }

    $('a[href^="#"]').on('click', function (e) {
        const target = $(this.getAttribute('href'));
        if (target.length) {
            e.preventDefault();
            $('html, body').stop().animate({
                scrollTop: target.offset().top - CONFIG.navigation.scrollOffset
            }, CONFIG.navigation.scrollDuration, 'swing');
        }
    });




    $(window).on('scroll', function () {

        if ($(window).scrollTop() > CONFIG.ui.navbarScrollThreshold) {
            $('.navbar').addClass('scrolled');
        } else {
            $('.navbar').removeClass('scrolled');
        }


        const scrollPos = $(window).scrollTop() + CONFIG.navigation.activeOffset;

        $('section[id]').each(function () {
            const section = $(this);
            const sectionTop = section.offset().top;
            const sectionBottom = sectionTop + section.outerHeight();
            const sectionId = section.attr('id');

            if (scrollPos >= sectionTop && scrollPos < sectionBottom) {

                $('.nav-link').removeClass('active');


                $('.nav-link[href="#' + sectionId + '"]').addClass('active');
            }
        });
    });




    function fetchAPIData() {
        $.ajax({
            url: CONFIG.api.baseUrl,
            method: 'GET',
            dataType: 'json',
            success: function (response) {
                displayAPIData(response);
            },
            error: function (xhr, status, error) {
                $('#api-content').html(`
                    <div class="col-12">
                        <div class="alert alert-danger" role="alert">
                            <i class="fas fa-exclamation-triangle"></i> 
                            Error loading data: ${error}
                        </div>
                    </div>
                `);
            }
        });
    }

    function displayAPIData(data) {
        let html = '';


        const itemsToShow = data.slice(0, 6);

        itemsToShow.forEach((item, index) => {
            const itemData = item.data || {};
            const dataFields = Object.keys(itemData).length > 0
                ? Object.entries(itemData).map(([key, value]) =>
                    `<strong>${key}:</strong> ${value}`
                ).join(' | ')
                : 'No additional data';

            html += `
                <div class="col-lg-4 col-md-6 mb-4" data-aos="fade-up" data-aos-delay="${index * 100}">
                    <div class="api-item">
                        <h4><i class="fas fa-mobile-alt"></i> ${item.name || 'Unnamed Item'}</h4>
                        <p><strong>ID:</strong> ${item.id}</p>
                        <p>${dataFields}</p>
                    </div>
                </div>
            `;
        });

        $('#api-content').html(html);


        AOS.refresh();
    }


    fetchAPIData();




    const dropZone = $('#drop-zone');
    const fileInput = $('#file-input');
    const previewContainer = $('#preview-container');
    const uploadMessage = $('#upload-message');
    let selectedFiles = [];


    dropZone.on('click', function (e) {

        if (!$(e.target).is('#file-input') && !$(e.target).closest('#file-input').length) {
            fileInput.click();
        }
    });


    fileInput.on('change', function (e) {
        e.stopPropagation();
        handleFiles(this.files);
    });


    dropZone.on('dragover', function (e) {
        e.preventDefault();
        e.stopPropagation();
        $(this).addClass('drag-over');
    });

    dropZone.on('dragleave', function (e) {
        e.preventDefault();
        e.stopPropagation();
        $(this).removeClass('drag-over');
    });

    dropZone.on('drop', function (e) {
        e.preventDefault();
        e.stopPropagation();
        $(this).removeClass('drag-over');

        const files = e.originalEvent.dataTransfer.files;
        handleFiles(files);
    });


    function handleFiles(files) {
        try {
            uploadMessage.removeClass('success error').text('');

            if (!files || files.length === 0) {
                showMessage('No files selected', 'error');
                return;
            }


            const imageFiles = Array.from(files).filter(file =>
                file.type.startsWith('image/')
            );

            if (imageFiles.length === 0) {
                showMessage('Please select valid image files', 'error');
                return;
            }

            selectedFiles = [...selectedFiles, ...imageFiles];
            displayPreviews();
            uploadFiles(imageFiles);
        } catch (error) {
            console.error('Error handling files:', error);
            showMessage('Error processing files. Please try again.', 'error');
        }
    }


    function displayPreviews() {
        try {
            previewContainer.empty();

            selectedFiles.forEach((file, index) => {
                const reader = new FileReader();

                reader.onload = function (e) {
                    try {
                        const previewItem = $(`
                            <div class="preview-item" data-index="${index}" data-aos="zoom-in">
                                <img src="${e.target.result}" alt="Preview">
                                <button class="remove-btn" data-index="${index}">
                                    <i class="fas fa-times"></i>
                                </button>
                            </div>
                        `);

                        previewContainer.append(previewItem);
                    } catch (error) {
                        console.error('Error creating preview item:', error);
                    }
                };

                reader.onerror = function () {
                    console.error('Error reading file:', file.name);
                    showMessage('Error reading file: ' + file.name, 'error');
                };

                reader.readAsDataURL(file);
            });


            setTimeout(() => {
                try {
                    AOS.refresh();
                } catch (error) {
                    console.error('Error refreshing AOS:', error);
                }
            }, 100);
        } catch (error) {
            console.error('Error displaying previews:', error);
            showMessage('Error displaying image previews', 'error');
        }
    }


    $(document).on('click', '.remove-btn', function (e) {
        e.preventDefault();
        e.stopPropagation();
        const index = parseInt($(this).data('index'));

        if (index >= 0 && index < selectedFiles.length) {
            selectedFiles.splice(index, 1);
            displayPreviews();
        }
    });


    function uploadFiles(files) {
        const formData = new FormData();

        files.forEach(file => {
            formData.append('images', file);
        });

        $.ajax({
            url: CONFIG.api.uploadEndpoint,
            method: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            xhr: function () {
                const xhr = new window.XMLHttpRequest();

                xhr.upload.addEventListener('progress', function (e) {
                    if (e.lengthComputable) {
                        const percentComplete = (e.loaded / e.total) * 100;
                        showMessage(`Uploading... ${Math.round(percentComplete)}%`, 'success');
                    }
                }, false);
                return xhr;
            },
            success: function (response) {
                showMessage(`✓ Successfully uploaded ${files.length} image(s)!`, 'success');
                setTimeout(() => {
                    uploadMessage.fadeOut();
                }, CONFIG.ui.messageDisplayDuration);
            },
            error: function (xhr, status, error) {
                showMessage(`✗ Upload failed: ${error}`, 'error');
            }
        });
    }


    function showMessage(message, type) {
        uploadMessage
            .removeClass('success error')
            .addClass(type)
            .html(`<i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i> ${message}`)
            .fadeIn();
    }




    const galleryModal = $('#gallery-modal');
    const galleryGrid = $('#gallery-grid');
    const viewGalleryBtn = $('#view-gallery-btn');
    const galleryModalClose = $('.gallery-modal-close');


    viewGalleryBtn.on('click', function () {
        try {
            loadGalleryImages();
            galleryModal.addClass('active');
            $('body').css('overflow', 'hidden');
        } catch (error) {
            console.error('Error opening gallery modal:', error);
        }
    });


    galleryModalClose.on('click', closeGalleryModal);

    galleryModal.on('click', function (e) {
        if ($(e.target).is('#gallery-modal')) {
            closeGalleryModal();
        }
    });

    function closeGalleryModal() {
        try {
            galleryModal.removeClass('active');
            $('body').css('overflow', 'auto');
        } catch (error) {
            console.error('Error closing gallery modal:', error);
        }
    }


    function loadGalleryImages() {
        try {
            $.ajax({
                url: CONFIG.api.imagesEndpoint,
                method: 'GET',
                success: function (response) {
                    try {
                        if (response && response.success && response.images && response.images.length > 0) {
                            displayGalleryImages(response.images);
                        } else {
                            showEmptyGallery();
                        }
                    } catch (error) {
                        console.error('Error processing gallery response:', error);
                        showEmptyGallery();
                    }
                },
                error: function (xhr, status, error) {
                    console.error('Error loading gallery images:', error);
                    showEmptyGallery();
                }
            });
        } catch (error) {
            console.error('Error initiating gallery load:', error);
            showEmptyGallery();
        }
    }


    function displayGalleryImages(images) {
        try {
            if (!images || !Array.isArray(images)) {
                showEmptyGallery();
                return;
            }

            galleryGrid.empty();

            images.forEach((image, index) => {
                try {
                    if (image && image.url) {
                        const galleryItem = $(`
                            <div class="gallery-item" data-aos="zoom-in" data-aos-delay="${index * 50}">
                                <img src="${image.url}" alt="${image.filename || 'Gallery image'}" onerror="this.parentElement.style.display='none'">
                            </div>
                        `);

                        galleryGrid.append(galleryItem);
                    }
                } catch (error) {
                    console.error('Error creating gallery item:', error);
                }
            });


            setTimeout(() => {
                try {
                    AOS.refresh();
                } catch (error) {
                    console.error('Error refreshing AOS in gallery:', error);
                }
            }, 100);
        } catch (error) {
            console.error('Error displaying gallery images:', error);
            showEmptyGallery();
        }
    }


    function showEmptyGallery() {
        galleryGrid.html(`
            <div class="gallery-empty">
                <i class="fas fa-images"></i>
                <h3>No Images Yet</h3>
                <p>Upload some images to see them in your gallery!</p>
            </div>
        `);
    }


    $(document).on('keydown', function (e) {
        if (e.key === 'Escape' && galleryModal.hasClass('active')) {
            closeGalleryModal();
        }
    });




    $('a[href="#error"]').on('click', function (e) {
        e.preventDefault();


        const alertHtml = `
            <div class="custom-alert" style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); 
                 background: rgba(20, 20, 20, 0.98); backdrop-filter: blur(20px); 
                 border: 2px solid rgba(255, 107, 53, 0.5); border-radius: 20px; padding: 2rem 3rem; 
                 z-index: 10000; text-align: center; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.8);">
                <i class="fas fa-exclamation-triangle" style="font-size: 3rem; color: #ff6b35; margin-bottom: 1rem;"></i>
                <h3 style="margin-bottom: 1rem; color: #fff;">Page Not Available</h3>
                <p style="color: #b0b0b0; margin-bottom: 1.5rem;">This page is not available. Only the main page is functional.</p>
                <button class="btn btn-primary" onclick="$(this).closest('.custom-alert-overlay').remove()">
                    Got It
                </button>
            </div>
            <div class="custom-alert-backdrop" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
                 background: rgba(0, 0, 0, 0.8); z-index: 9999;" 
                 onclick="$(this).closest('.custom-alert-overlay').remove()"></div>
        `;

        $('body').append(`<div class="custom-alert-overlay">${alertHtml}</div>`);
    });




    $(window).on('scroll', function () {
        const scrolled = $(window).scrollTop();
        $('.hero-bg-image').css('transform', `translateY(${scrolled * 0.5}px)`);
    });




    function animateCounter(element, target) {
        let current = 0;
        const increment = target / 100;
        const timer = setInterval(function () {
            current += increment;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            $(element).text(Math.floor(current) + '+');
        }, 20);
    }


    let countersAnimated = false;
    $(window).on('scroll', function () {
        if (!countersAnimated && $('.hero-stats').length) {
            const statsTop = $('.hero-stats').offset().top;
            const scrollTop = $(window).scrollTop();
            const windowHeight = $(window).height();

            if (scrollTop + windowHeight > statsTop) {
                animateCounter('.stat-item:eq(0) .stat-number', 15000);
                animateCounter('.stat-item:eq(1) .stat-number', 50);
                animateCounter('.stat-item:eq(2) .stat-number', 100);
                countersAnimated = true;
            }
        }
    });




    $('.navbar-nav .nav-link').on('click', function () {
        if ($(window).width() < 992) {
            $('.navbar-collapse').collapse('hide');
        }
    });

});
