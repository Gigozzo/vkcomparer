
$(document).ready(function () {
	// Заполняем таблицу
	//fillTableFromLocStorage();

	$('#add-org-form').validate({
		// Сброс состояния полей ввода
		init: function() { $(this).children('input').css({'background-color' : '#fff'}) },

		success: function(event) {
console.log('<<success>>');
			event.preventDefault();
			var newOrg = $(this).serializeFormToObject();
console.log('newOrg:');
console.log(newOrg);

// Можно не перезагружать страницу, а просто заполнять таблицу
// Но тогда встаёт вопрос передачи параметра modified
/*
			$('#orgs-table').append($('#tableRow').tmpl({
				'title': newOrg.title,
				'nets': newOrg.nets
			}));
*/
			$(this)[0].reset();

			// Режим редактирования
			var editingRow = $('#orgs-table [data-id=row].warning').children();

			if (editingRow.length) {
				$('[data-id=submit]', this).removeClass('btn-warning').html('Add');
				localStorage.removeItem([editingRow[0].textContent, '<key>', editingRow[1].textContent].join(''));
				editingRow.remove();
			};

			// Запись в локальное хранилище
			try { localStorage.setItem([newOrg.author, '<key>', newOrg.title].join(''), JSON.stringify(newOrg)) }
			catch (exception) { (exception == QUOTA_EXCEEDED_ERR) && alert('Local storage is full! Quota exceeded!') }
		},
		fail: function(invalids) {
console.log('<<fail>>');
			$.each(invalids, function(index, invalid) {
				// Кастомное отображение ошибки валидации (В bootstrap не нашёлся хороший аналог)
				$(invalid).val('').css({'background-color' : 'rgb(255, 113, 113)'});
			});
		}
	});

	// Обработчик нажатия на кнопку отмены
	$('#add-org-form [data-id=cancel]').click(function (event) {
console.log('<<Обработчик нажатия на кнопку отмены>>');
		$(this).siblings('[data-id=submit]').removeClass('btn-warning').html('Add')
			.siblings('input').css({'background-color' : '#fff'});

		$('#orgs-table [data-id=row]').removeClass('warning');
	});

	// Обработчик нажатия на кнопку редактирования
	$('#orgs-table').on('click', '[data-id=edit-org]', function (event) {
console.log('<<Обработчик нажатия на кнопку редактирования>>');
		var row = $(event.currentTarget).closest('[data-id=row]').children(),
			org = JSON.parse(localStorage.getItem([row[0].textContent, '<key>', row[1].textContent].join('')));

		$('#add-org-form [data-id=author]').val(org.author)
			.siblings('[data-id=publishedYear]').val(org.publishedYear)
			.siblings('[data-id=title]').val(org.title)
			.siblings('[data-id=pages]').val(org.pages);

		$('#add-org-form [data-id=submit]').addClass('btn-warning').html('Apply');

		$(event.currentTarget).closest('[data-id=row]').addClass('warning')
			.siblings().removeClass('warning');
	});

	// Обработчик нажания на кнопку удаления
	$('#orgs-table').on('click', '[data-id=remove-org]', function (event) {
console.log('<<Обработчик нажатия на кнопку удаления>>');
		var row = $(event.currentTarget).closest('[data-id=row]').children();

		row.remove();
		localStorage.removeItem([row[0].textContent, '<key>', row[1].textContent].join(''));

		$('#add-org-form [data-id=submit]').removeClass('btn-warning').html('Add')
			.siblings('input').css({'background-color' : '#fff'});

		$('#add-org-form')[0].reset();
	});
});

$.fn.serializeFormToObject = function() { return this.serializeArray().reduce(function(obj, el) { obj[el.name] = el.value; return obj }, new Object) };

fillTableFromLocStorage = function() {
	$.each(localStorage, function(key, value) {
		if (key.match('.+\<key\>.+')) {
			var org = JSON.parse(value);
			$('#orgs-table').append($('#tableRow').tmpl({
				'author': org.author,
				'title': org.title,
			}))
		}
	})

};