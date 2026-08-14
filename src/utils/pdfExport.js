import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

export async function exportDailyExpensesPDF({
  selectedDate,
  dayEntries,
  totalAmount,
  withdrawTotal = 0,
  onlineTotal,
  cashTotal,
  itemCount
}) {
  try {
    const formattedDate = new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = doc.internal.pageSize.getWidth();

    // Brand Colors
    const primaryColor = [15, 157, 88]; // gPay emerald
    const darkSlate = [30, 41, 59];
    const borderGray = [226, 232, 240];

    // Header Background Accent
    doc.setFillColor(15, 157, 88);
    doc.rect(0, 0, pageWidth, 24, 'F');

    // App Title
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('Daily Expense Billing Tracker', 14, 15);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Daily Summary Statement', pageWidth - 14, 15, { align: 'right' });

    // Date & Summary Card Box
    let currentY = 32;
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
    doc.roundedRect(14, currentY, pageWidth - 28, 30, 3, 3, 'FD');

    doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text(`Date: ${formattedDate}`, 20, currentY + 10);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(`Total Expense Items: ${itemCount}`, 20, currentY + 17);
    if (withdrawTotal > 0) {
      doc.setTextColor(37, 99, 235);
      doc.text(`Cash Withdraw (Bank/Post): Rs. ${withdrawTotal.toLocaleString('en-IN')}`, 20, currentY + 23);
    }

    // Right Column Totals
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text(`Expense Total: Rs. ${totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, pageWidth - 20, currentY + 11, { align: 'right' });

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(51, 65, 85);
    doc.text(`Online: Rs. ${onlineTotal.toLocaleString('en-IN')}  |  Cash: Rs. ${cashTotal.toLocaleString('en-IN')}`, pageWidth - 20, currentY + 18, { align: 'right' });

    currentY += 38;

    // Table Header
    doc.setFillColor(241, 245, 249);
    doc.rect(14, currentY, pageWidth - 28, 8, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);

    doc.text('Cat #', 18, currentY + 5.5);
    doc.text('Category / Item Name', 32, currentY + 5.5);
    doc.text('Payment Mode', 105, currentY + 5.5);
    doc.text('Details / Notes', 135, currentY + 5.5);
    doc.text('Amount (Rs.)', pageWidth - 18, currentY + 5.5, { align: 'right' });

    currentY += 9;

    if (dayEntries.length === 0) {
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(10);
      doc.setTextColor(148, 163, 184);
      doc.text('No expenses recorded for this date.', pageWidth / 2, currentY + 10, { align: 'center' });
      currentY += 20;
    } else {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);

      dayEntries.forEach((item, idx) => {
        if (currentY > 265) {
          doc.addPage();
          currentY = 20;
        }

        const isEven = idx % 2 === 0;
        if (isEven) {
          doc.setFillColor(250, 250, 250);
          doc.rect(14, currentY - 1, pageWidth - 28, 8, 'F');
        }

        doc.setTextColor(71, 85, 105);
        doc.text(String(idx + 1), 18, currentY + 4.5);

        doc.setFont('helvetica', 'bold');
        doc.setTextColor(30, 41, 59);
        const isWithdraw = item.isCashWithdraw;
        const nameText = item.categoryName + (item.withdrawOption ? ` (${item.withdrawOption})` : '') + (isWithdraw ? ' *' : '');
        doc.text(nameText, 32, currentY + 4.5);

        doc.setFont('helvetica', 'normal');
        if (isWithdraw) {
          doc.setTextColor(37, 99, 235);
          doc.text('Withdrawal', 105, currentY + 4.5);
        } else {
          doc.setTextColor(item.paymentMode === 'Online' ? 16 : 180, item.paymentMode === 'Online' ? 120 : 83, item.paymentMode === 'Online' ? 90 : 9);
          doc.text(item.paymentMode || 'Online', 105, currentY + 4.5);
        }

        doc.setTextColor(100, 116, 139);
        const noteSnippet = item.note ? (item.note.length > 25 ? item.note.substring(0, 25) + '...' : item.note) : '-';
        doc.text(noteSnippet, 135, currentY + 4.5);

        doc.setFont('helvetica', 'bold');
        if (isWithdraw) {
          doc.setTextColor(37, 99, 235);
        } else {
          doc.setTextColor(15, 118, 110);
        }
        const amtStr = `Rs. ${parseFloat(item.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
        doc.text(amtStr, pageWidth - 18, currentY + 4.5, { align: 'right' });

        currentY += 8;
      });
    }

    doc.setDrawColor(203, 213, 225);
    doc.line(14, currentY + 2, pageWidth - 14, currentY + 2);
    currentY += 8;

    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('* Note: Cash Withdrawals are cash transfers and are excluded from the Expense Total.', 14, currentY);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text('Generated by Daily Expense Billing Tracker • Local Storage Backup', pageWidth / 2, 285, { align: 'center' });

    doc.save(`Expense_Summary_${selectedDate}.pdf`);
  } catch (err) {
    console.error('PDF generation error:', err);
    alert('Failed to generate PDF. Please try again.');
  }
}

export async function exportMonthlyExpensesPDF({
  monthLabel,
  sortedDaySummaries,
  monthlyTotal,
  monthlyOnline,
  monthlyCash,
  monthlyWithdraw,
  totalDaysLogged
}) {
  try {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const primaryColor = [15, 157, 88];
    const darkSlate = [30, 41, 59];
    const borderGray = [226, 232, 240];

    // Header Accent
    doc.setFillColor(15, 157, 88);
    doc.rect(0, 0, pageWidth, 26, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('Daily Expense Billing Tracker', 14, 16);

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(`Monthly Detailed Statement: ${monthLabel}`, pageWidth - 14, 16, { align: 'right' });

    // Monthly Overview Banner Box
    let currentY = 34;
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
    doc.roundedRect(14, currentY, pageWidth - 28, 34, 3, 3, 'FD');

    doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text(`Monthly Statement: ${monthLabel}`, 20, currentY + 10);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(`Total Logged Days: ${totalDaysLogged} day(s)`, 20, currentY + 18);
    if (monthlyWithdraw > 0) {
      doc.setTextColor(37, 99, 235);
      doc.text(`Total Cash Withdrawals: Rs. ${monthlyWithdraw.toLocaleString('en-IN')}`, 20, currentY + 25);
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text(`Monthly Grand Total: Rs. ${monthlyTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, pageWidth - 20, currentY + 11, { align: 'right' });

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(51, 65, 85);
    doc.text(`Online: Rs. ${monthlyOnline.toLocaleString('en-IN')}  |  Cash: Rs. ${monthlyCash.toLocaleString('en-IN')}`, pageWidth - 20, currentY + 19, { align: 'right' });

    currentY += 42;

    if (sortedDaySummaries.length === 0) {
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(10);
      doc.setTextColor(148, 163, 184);
      doc.text('No expenses recorded for this month.', pageWidth / 2, currentY + 10, { align: 'center' });
      currentY += 20;
    } else {
      // Loop over each day and render detailed categories
      sortedDaySummaries.forEach((day) => {
        // Page overflow check for date header
        if (currentY > 250) {
          doc.addPage();
          currentY = 20;
        }

        const formattedDayDate = new Date(day.date + 'T00:00:00').toLocaleDateString('en-IN', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        });

        // Date Banner Header
        doc.setFillColor(241, 245, 249);
        doc.rect(14, currentY, pageWidth - 28, 7, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(30, 41, 59);
        doc.text(`Date: ${formattedDayDate}`, 18, currentY + 5);

        doc.setFontSize(9);
        doc.setTextColor(15, 118, 110);
        doc.text(`Day Expense Total: Rs. ${day.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, pageWidth - 18, currentY + 5, { align: 'right' });

        currentY += 9;

        // Render itemized categories for this day
        if (day.entries && day.entries.length > 0) {
          // Subtable column headers
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(8);
          doc.setTextColor(100, 116, 139);
          doc.text('#', 20, currentY);
          doc.text('Category Item Name', 32, currentY);
          doc.text('Payment Mode', 105, currentY);
          doc.text('Details / Notes', 135, currentY);
          doc.text('Amount (Rs.)', pageWidth - 18, currentY, { align: 'right' });
          currentY += 4;

          doc.setFont('helvetica', 'normal');
          doc.setFontSize(8.5);

          day.entries.forEach((item, itemIdx) => {
            if (currentY > 268) {
              doc.addPage();
              currentY = 20;
            }

            const isWithdraw = item.isCashWithdraw;

            doc.setTextColor(100, 116, 139);
            doc.text(String(itemIdx + 1), 20, currentY);

            doc.setFont('helvetica', 'bold');
            doc.setTextColor(30, 41, 59);
            const nameText = item.categoryName + (item.withdrawOption ? ` (${item.withdrawOption})` : '') + (isWithdraw ? ' *' : '');
            doc.text(nameText, 32, currentY);

            doc.setFont('helvetica', 'normal');
            if (isWithdraw) {
              doc.setTextColor(37, 99, 235);
              doc.text('Withdrawal', 105, currentY);
            } else {
              doc.setTextColor(item.paymentMode === 'Online' ? 16 : 180, item.paymentMode === 'Online' ? 120 : 83, item.paymentMode === 'Online' ? 90 : 9);
              doc.text(item.paymentMode || 'Online', 105, currentY);
            }

            doc.setTextColor(100, 116, 139);
            const noteText = item.note ? (item.note.length > 25 ? item.note.substring(0, 25) + '...' : item.note) : '-';
            doc.text(noteText, 135, currentY);

            doc.setFont('helvetica', 'bold');
            if (isWithdraw) {
              doc.setTextColor(37, 99, 235);
            } else {
              doc.setTextColor(15, 118, 110);
            }
            const amtStr = `Rs. ${parseFloat(item.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
            doc.text(amtStr, pageWidth - 18, currentY, { align: 'right' });

            currentY += 5.5;
          });
        }

        currentY += 4; // Space between days
      });
    }

    // Grand Total Summary Box at the end of the PDF
    if (currentY > 240) {
      doc.addPage();
      currentY = 20;
    }

    doc.setFillColor(236, 253, 245);
    doc.setDrawColor(167, 243, 208);
    doc.roundedRect(14, currentY, pageWidth - 28, 28, 3, 3, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(6, 78, 59);
    doc.text(`Monthly Expense Grand Total Summary (${monthLabel})`, 20, currentY + 9);

    doc.setFontSize(13);
    doc.setTextColor(15, 118, 110);
    doc.text(`Grand Total: Rs. ${monthlyTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, pageWidth - 20, currentY + 10, { align: 'right' });

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(51, 65, 85);
    doc.text(`Online Total: Rs. ${monthlyOnline.toLocaleString('en-IN')}   |   Cash Total: Rs. ${monthlyCash.toLocaleString('en-IN')}`, 20, currentY + 18);
    
    if (monthlyWithdraw > 0) {
      doc.setTextColor(37, 99, 235);
      doc.text(`Cash Withdrawals (Excluded from Total): Rs. ${monthlyWithdraw.toLocaleString('en-IN')}`, pageWidth - 20, currentY + 18, { align: 'right' });
    }

    currentY += 34;

    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('* Note: Cash Withdrawals are cash transfers and are excluded from the Monthly Expense Total.', 14, currentY);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text('Generated by Daily Expense Billing Tracker • Detailed Monthly Statement', pageWidth / 2, 285, { align: 'center' });

    const safeMonthFileName = monthLabel.replace(/\s+/g, '_');
    doc.save(`Monthly_Detailed_Expense_Statement_${safeMonthFileName}.pdf`);
  } catch (err) {
    console.error('Monthly PDF generation error:', err);
    alert('Failed to generate Monthly PDF. Please try again.');
  }
}
