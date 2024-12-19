from django.http import HttpResponse, JsonResponse
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .models import PaperRank
from .serializers import PaperRankSerializer
import csv, io
from django.db.models import Min, Max, Count
from collections import Counter
import re
from django.db import transaction
from django.db.models import Count
from wordcloud import WordCloud
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import io
import base64
import atexit
import os


# @api_view(['POST'])
# def upload_csv(request):
#     if 'myfile' not in request.FILES:
#         return Response({"error": "No file uploaded"}, status=status.HTTP_400_BAD_REQUEST)
    
#     file = request.FILES['myfile']

#     if not file.name.endswith('.csv'):
#         return Response({"error": "Please upload a CSV file"}, status=status.HTTP_400_BAD_REQUEST)

#     # Read CSV file
#     data_set = file.read().decode('UTF-8')
#     io_string = io.StringIO(data_set)
#     next(io_string)  # Skip the header row


#     for row in csv.reader(io_string, delimiter=',', quotechar='"'):
#         PaperRank.objects.update_or_create(
#             # Authors=row[0],
#             # Year=row[1],
#             # Publisher=row[2],
#             # Language=row[3],
#             # Document=row[4],
#             # Affiliations=row[5]
#             Authors=row[0],
#             Authors_full_names=row[1],
#             Author_ID=row[2],
#             Title=row[3],
#             Year=row[4],
#             Source_title=row[5],
#             Volume=row[6],
#             Issue=row[7],
#             Art_No=row[8],
#             Page_start=row[9],
#             Page_end=row[10],
#             Page_count=row[11],
#             Citations=row[12],
#             DOI=row[13],
#             Link=row[14],
#             Affiliations=row[15],
#             Authors_with_Affiliations=row[16],
#             Abstract=row[17],
#             Author_Keywords=row[18],
#             Index_Keywords=row[19],
#             Molecular_Sequence_Numbers=row[20],
#             Chemicals=row[21],
#             Tradenames=row[22],
#             Manufacturers=row[23],
#             Funding_Details=row[24],
#             Funding_Texts=row[25],
#             Reference=row[26],
#             Correspondence_Address=row[27],
#             Editors=row[28],
#             Publisher=row[29],
#             Sponsors=row[30],
#             Conference_name=row[31],
#             Conference_date=row[32],
#             Conference_location=row[33],
#             Conference_code=row[34],
#             ISSN=row[35],
#             ISBN=row[36],
#             CODEN=row[37],
#             PubMed_ID=row[38],
#             Language=row[39],
#             Abbreviated_Source_Title=row[40],
#             Document=row[41],
#             Publication_Stage=row[42],
#             Open_Access=row[43],
#             Source=row[44],
      
#         )

#     return Response({"message": "File uploaded and processed successfully!"}, status=status.HTTP_201_CREATED)

from django.db import transaction

@api_view(['POST'])
def upload_csv(request):
    if 'myfile' not in request.FILES:
        return Response({"error": "No file uploaded"}, status=status.HTTP_400_BAD_REQUEST)
    
    file = request.FILES['myfile']

    if not file.name.endswith('.csv'):
        return Response({"error": "Please upload a CSV file"}, status=status.HTTP_400_BAD_REQUEST)

    # Read CSV file
    data_set = file.read().decode('UTF-8')
    io_string = io.StringIO(data_set)
    next(io_string)  # Skip the header row

    rows = []
    for row in csv.reader(io_string, delimiter=',', quotechar='"'):
        # Create the instance (without saving to DB yet)
        paper_rank = PaperRank(
            Authors=row[0],
            Authors_full_names=row[1],
            Author_ID=row[2],
            Title=row[3],
            Year=row[4],
            Source_title=row[5],
            Volume=row[6],
            Issue=row[7],
            Art_No=row[8],
            Page_start=row[9],
            Page_end=row[10],
            Page_count=row[11],
            Citations=row[12],
            DOI=row[13],
            Link=row[14],
            Affiliations=row[15],
            Authors_with_Affiliations=row[16],
            Abstract=row[17],
            Author_Keywords=row[18],
            Index_Keywords=row[19],
            Molecular_Sequence_Numbers=row[20],
            Chemicals=row[21],
            Tradenames=row[22],
            Manufacturers=row[23],
            Funding_Details=row[24],
            Funding_Texts=row[25],
            Reference=row[26],
            Correspondence_Address=row[27],
            Editors=row[28],
            Publisher=row[29],
            Sponsors=row[30],
            Conference_name=row[31],
            Conference_date=row[32],
            Conference_location=row[33],
            Conference_code=row[34],
            ISSN=row[35],
            ISBN=row[36],
            CODEN=row[37],
            PubMed_ID=row[38],
            Language=row[39],
            Abbreviated_Source_Title=row[40],
            Document=row[41],
            Publication_Stage=row[42],
            Open_Access=row[43],
            Source=row[44],
        )
        rows.append(paper_rank)

    # Insert all rows in a single query
    with transaction.atomic():
        PaperRank.objects.bulk_create(rows)

    return Response({"message": "File uploaded and processed successfully!"}, status=status.HTTP_201_CREATED)


@api_view(['GET'])
def get_data(request):
    # Fetch all SongRank records from the database
    songs = PaperRank.objects.all()
    
    # Serialize the records to JSON format
    serializer = PaperRankSerializer(songs, many=True)
    
    # Return the serialized data
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['DELETE'])
def delete_all_records(request):
    try:
        # Delete all records in the PaperRank table
        PaperRank.objects.all().delete()
        return Response({"message": "All records deleted successfully."}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
    

@api_view(['GET'])
def csv_summary(request):
    try:
        
        total_papers = PaperRank.objects.count()
        
        
        year_min = PaperRank.objects.aggregate(Min('Year'))['Year__min']
        year_max = PaperRank.objects.aggregate(Max('Year'))['Year__max']

        
        # Fetch all author lists from the database
        all_authors = PaperRank.objects.values_list('Authors', flat=True)

        # Create a set to store unique authors
        unique_authors = set()

        # Iterate over all author lists
        for author_list in all_authors:
            if author_list:  # Ensure the author list is not empty or None
                # Remove square brackets, quotes, and any unnecessary characters
                cleaned_author_list = re.sub(r'[\[\]\'"]', '', author_list)
                
                # Split the cleaned author list by commas (since they are comma-separated)
                authors = [author.strip() for author in cleaned_author_list.split(";")]
                
                # Add each author to the set (this ensures uniqueness)
                unique_authors.update(authors)

        # Get the number of unique authors
        num_unique_authors = len(unique_authors)

        
        all_publisher = PaperRank.objects.values_list('Publisher', flat=True)
        unique_publisher = set()
        for publisher_list in all_publisher:
            if publisher_list:
                publishers = [publisher.strip() for publisher in re.split(r';\s*', publisher_list)]
                unique_publisher.update(publishers)

        num_unique_publishers = len(unique_publisher)

        
        all_affiliation = PaperRank.objects.values_list('Affiliations', flat=True)
        unique_affiliation = set()
        for affiliation_list in all_affiliation:
            if affiliation_list:
                affiliations = [affiliation.strip() for affiliation in re.split(r';\s*',affiliation_list)]
                unique_affiliation.update(affiliations)

        num_unique_affiliation = len(unique_affiliation)

       
        document_type_counts = PaperRank.objects.values('Document').annotate(count=Count('Document'))

      
        language_counts = PaperRank.objects.values('Language').annotate(count=Count('Language'))

     
        summary = {
            "total_papers": total_papers,
            "year_range": f"{year_min} - {year_max}",
            "num_unique_authors": num_unique_authors,
            "num_unique_publishers": num_unique_publishers,
            "num_unique_affilation": num_unique_affiliation,
            "document_type_counts": {item['Document']: item['count'] for item in document_type_counts},
            "languages": {item['Language']: item['count'] for item in language_counts}
            
        }
        
        
        return Response(summary, status=status.HTTP_200_OK)
    
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
    
@api_view(['GET'])
def get_chart_data(request):
    try:
        data = PaperRank.objects.all()
        serializer = PaperRankSerializer(data, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
def get_papers(request):
    papers = PaperRank.objects.all()
    serializer = PaperRankSerializer(papers, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK) 

@api_view(['GET'])
def most_relevant_authors(request):
    authors = PaperRank.objects.values('Authors').annotate(
        publications=Count('Authors')).order_by('-publications')[:10]  # Get top 10 authors
    
    return Response(authors) 

@api_view(['GET'])
def get_average_citations(request):
    try:
        papers = PaperRank.objects.all()[:10]  # Get first 10 papers for testing
        data = [{"Title": paper.Title, "Year": paper.Year, "Citations": paper.Citations} for paper in papers]
        return Response(data, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    
@api_view(['GET'])
def get_top_cited_documents(request):
    try:
        # Get top 10 cited documents
        top_documents = PaperRank.objects.order_by('-Citations')[:10]
        
        # Prepare data for response
        documents_data = []
        for doc in top_documents:
            documents_data.append({
                'Title': doc.Title,
                'Authors': doc.Authors,
                'Year': doc.Year,
                'Citations': doc.Citations,
                'Source_title': doc.Source_title,
                'DOI': doc.DOI
            })
        
        return JsonResponse({'documents': documents_data})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@api_view(['GET'])
def get_most_cited_authors(request):
    try:
        # Get all papers
        papers = PaperRank.objects.all()
        
        # Extract and clean author names, and count citations
        author_citations = {}
        for paper in papers:
            if paper.Authors and paper.Citations:
                # Remove square brackets, quotes, and any unnecessary characters
                cleaned_author_list = re.sub(r'[\[\]\'"]', '', paper.Authors)
                
                # Split the cleaned author list by semicolons
                authors = [author.strip() for author in cleaned_author_list.split(";")]
                
                # Add citations to each author
                citations = int(paper.Citations) if paper.Citations.isdigit() else 0
                for author in authors:
                    if author in author_citations:
                        author_citations[author] += citations
                    else:
                        author_citations[author] = citations
        
        # Get top 10 cited authors
        top_authors = sorted(author_citations.items(), key=lambda x: x[1], reverse=True)[:10]
        
        # Prepare data for response
        authors_data = [
            {
                'Authors': author[0],
                'citations': author[1]
            }
            for author in top_authors
        ]
        
        return JsonResponse(authors_data, safe=False)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@api_view(['GET'])  
def generate_word_cloud(request):
    try:
        # Get all papers
        papers = PaperRank.objects.all()
        
        # Combine all Index_Keywords
        all_keywords = []
        for paper in papers:
            if paper.Index_Keywords:
                # Remove square brackets, quotes, and split by semicolon
                keywords = re.sub(r'[\[\]\'"]', '', paper.Index_Keywords).split(';')
                all_keywords.extend([keyword.strip() for keyword in keywords if keyword.strip()])
        
        # Count keyword occurrences
        keyword_counts = Counter(all_keywords)
        
        # Generate word cloud
        wordcloud = WordCloud(width=800, height=400, background_color='white').generate_from_frequencies(keyword_counts)
        
        # Create a plot
        plt.figure(figsize=(10, 5))
        plt.imshow(wordcloud, interpolation='bilinear')
        plt.axis('off')
        
        # Save the plot to a bytes buffer
        buffer = io.BytesIO()
        plt.savefig(buffer, format='png')
        buffer.seek(0)
        
        # Encode the image to base64
        image_base64 = base64.b64encode(buffer.getvalue()).decode('utf-8')
        
        # Return the base64 encoded image
        return HttpResponse(image_base64, content_type='text/plain')
    except Exception as e:
        return HttpResponse(str(e), status=500)

@api_view(['GET'])    
def get_trend_topics(request):
    try:
        # Get all papers
        papers = PaperRank.objects.all().order_by('Year')
        
        # Initialize data structure
        trend_data = {}
        
        for paper in papers:
            year = paper.Year
            if year not in trend_data:
                trend_data[year] = Counter()
            
            if paper.Index_Keywords:
                # Remove square brackets, quotes, and split by semicolon
                keywords = re.sub(r'[\[\]\'"]', '', paper.Index_Keywords).split(';')
                trend_data[year].update([keyword.strip() for keyword in keywords if keyword.strip()])
        
        # Get top 10 keywords for each year
        result = {}
        for year, counter in trend_data.items():
            result[year] = counter.most_common(10)
        
        return JsonResponse(result)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)
    
@api_view(['GET'])
def get_team_sizes(request):
    try:
        
        all_papers = PaperRank.objects.all()
        
        
        team_size_counts = {}
        
        
        for paper in all_papers:
            # Check if Authors field is not empty
            if paper.Authors:
                # Remove square brackets, quotes, and any unnecessary characters
                cleaned_author_list = re.sub(r'[\[\]\'"]', '', paper.Authors)
                
                # Split the cleaned author list by semicolons
                authors = [author.strip() for author in cleaned_author_list.split(";")]
                
                # Count the number of unique authors
                team_size = len(set(authors))
                
                # Update team size counts
                team_size_str = str(team_size)
                if team_size_str in team_size_counts:
                    team_size_counts[team_size_str] += 1
                else:
                    team_size_counts[team_size_str] = 1
        
        # Return the team size distribution
        return JsonResponse(team_size_counts)
    
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)
    
# @api_view(['POST'])
# def merge_csv_files(request):
    if not request.FILES:
        return Response({"error": "No files uploaded"}, status=status.HTTP_400_BAD_REQUEST)
    
    # Get all uploaded files
    files = request.FILES.getlist('files[]')
    
    if len(files) < 2:
        return Response({"error": "Please upload at least two CSV files"}, 
                       status=status.HTTP_400_BAD_REQUEST)
    
    try:
        # Initialize list to store all data
        all_data = []
        headers = None
        
        # Process each file
        for file in files:
            if not file.name.endswith('.csv'):
                return Response({"error": f"File {file.name} is not a CSV file"}, 
                              status=status.HTTP_400_BAD_REQUEST)
            
            # Read CSV file
            data_set = file.read().decode('UTF-8')
            io_string = io.StringIO(data_set)
            csv_reader = csv.reader(io_string, delimiter=',', quotechar='"')
            
            # Get headers from first file
            if headers is None:
                headers = next(csv_reader)
            else:
                # Skip header for subsequent files
                next(csv_reader)
            
            # Add all rows to the consolidated data
            all_data.extend(list(csv_reader))
        
        # Create merged file
        merged_file_path = 'uploads/merged.csv'
        os.makedirs('uploads', exist_ok=True)
        
        with open(merged_file_path, 'w', newline='') as f:
            writer = csv.writer(f)
            writer.writerow(headers)
            writer.writerows(all_data)
        
        # Return the path to the merged file
        return Response({
            "message": "Files merged successfully",
            "merged_file_path": merged_file_path
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        return Response({
            "error": f"An error occurred while merging files: {str(e)}"
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
# @api_view(['POST'])
# def upload_csv_files(request):
    if not request.FILES:
        return Response({"error": "No files uploaded"}, status=status.HTTP_400_BAD_REQUEST)

    files = request.FILES.getlist('myfile')  # Get all uploaded files
    
    if not files:
        return Response({"error": "No files found in the request"}, status=status.HTTP_400_BAD_REQUEST)

    total_rows = []
    processed_files = 0
    errors = []

    try:
        for file in files:
            print("File name:", file.name)
            print("File size:", file.size)
            print("File type:", file.content_type)

            if not file.name.endswith('.csv'):
                errors.append(f"File {file.name} is not a CSV file")
                continue

            # Read CSV file
            try:
                data_set = file.read().decode('UTF-8')
                io_string = io.StringIO(data_set)
                next(io_string)  # Skip the header row

                file_rows = []
                for row in csv.reader(io_string, delimiter=',', quotechar='"'):
                    if len(row) != 45:  # Validate row length
                        errors.append(f"Invalid row format in {file.name}")
                        continue
                        
                    # Add type conversion and error handling for numeric fields
                    try:
                        paper_rank = PaperRank(
                            Authors=row[0],
                            Authors_full_names=row[1],
                            Author_ID=row[2],
                            Title=row[3],
                            Year=int(row[4]) if row[4] else None,
                            Source_title=row[5],
                            Volume=row[6],
                            Issue=row[7],
                            Art_No=row[8],
                            Page_start=row[9],
                            Page_end=row[10],
                            Page_count=int(row[11]) if row[11] else None,
                            Citations=int(row[12]) if row[12] else 0,
                            DOI=row[13],
                            Link=row[14],
                            Affiliations=row[15],
                            Authors_with_Affiliations=row[16],
                            Abstract=row[17],
                            Author_Keywords=row[18],
                            Index_Keywords=row[19],
                            Molecular_Sequence_Numbers=row[20],
                            Chemicals=row[21],
                            Tradenames=row[22],
                            Manufacturers=row[23],
                            Funding_Details=row[24],
                            Funding_Texts=row[25],
                            Reference=row[26],
                            Correspondence_Address=row[27],
                            Editors=row[28],
                            Publisher=row[29],
                            Sponsors=row[30],
                            Conference_name=row[31],
                            Conference_date=row[32],
                            Conference_location=row[33],
                            Conference_code=row[34],
                            ISSN=row[35],
                            ISBN=row[36],
                            CODEN=row[37],
                            PubMed_ID=row[38],
                            Language=row[39],
                            Abbreviated_Source_Title=row[40],
                            Document=row[41],
                            Publication_Stage=row[42],
                            Open_Access=row[43],
                            Source=row[44],
                        )
                        file_rows.append(paper_rank)
                    except ValueError as ve:
                        errors.append(f"Data conversion error in {file.name}: {str(ve)}")
                        continue

                total_rows.extend(file_rows)
                processed_files += 1

            except UnicodeDecodeError:
                # Try alternative encodings if UTF-8 fails
                try:
                    data_set = file.read().decode('latin-1')
                    # Repeat processing with latin-1 encoding
                    # (similar code as above, but with latin-1)
                except Exception as e:
                    errors.append(f"Encoding error in file {file.name}: {str(e)}")
                    continue
            except Exception as e:
                errors.append(f"Error processing file {file.name}: {str(e)}")
                continue

        if total_rows:
            # Use transaction to ensure atomic operation
            with transaction.atomic():
                PaperRank.objects.bulk_create(total_rows)

        # Prepare response
        response_data = {
            "message": f"Successfully processed {processed_files} files",
            "total_records": len(total_rows),
        }
        
        if errors:
            response_data["warnings"] = errors

        return Response(response_data, 
                       status=status.HTTP_201_CREATED if total_rows else status.HTTP_400_BAD_REQUEST)

    except Exception as e:
        # Add detailed error logging
        import traceback
        print("Full Error Traceback:")
        traceback.print_exc()
        
        return Response({
            "error": str(e),
            "traceback": traceback.format_exc()
        }, status=status.HTTP_400_BAD_REQUEST)